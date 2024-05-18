import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import * as jose from 'jose';
import { Issuer, generators } from 'openid-client';

import { isDevelopment } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH0_CLIENT_ID = 'gq575MGFWuiYcXpPTXNoJNYfAuoq19KD';

let jwks;

const secretsFile = '/secrets/unreed-production';
if (fs.existsSync(secretsFile)) {
  console.log(`Loading secrets from ${secretsFile}`);
  const input = fs.readFileSync(secretsFile, 'utf-8');
  const data = JSON.parse(input);
  process.env.DB_HOST = data.DB_HOST;
  process.env.DB_USER = data.DB_USER;
  process.env.DB_PASS = data.DB_PASS;
  process.env.DB_NAME = data.DB_NAME;
  process.env.GOOGLE_CLIENT_SECRET = data.GOOGLE_CLIENT_SECRET;
  process.env.AUTH0_CLIENT_SECRET = data.AUTH0_CLIENT_SECRET;
  jwks = data.JWKS;
} else {
  jwks = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'keys.localhost.json')));
}

const auth0Issuer = await Issuer.discover(
  'https://dev-fxrac16ih4t75q3f.us.auth0.com/.well-known/openid-configuration',
);

function getAuth0Client(req) {
  return new auth0Issuer.Client({
    client_id: AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    redirect_uris: [getRedirectUrl(req)],
    response_types: ['code'],
  });
}

const privateKeys = jose.createLocalJWKSet(jwks.public);
const privateKey = await jose.importJWK(jwks.private, 'ES256');

const issuer = `urn:unreed-${isDevelopment() ? 'dev' : 'prod'}:issuer`;
const audience = `urn:unreed-${isDevelopment() ? 'dev' : 'prod'}:audience`;

const maxAge = 2147483647;
const AUTH_COOKIE = 'UNREED_OIDC_TOKEN';
const REDIRECT_URI_COOKIE = 'UNREED_REDIRECT_URI';
const AUTH_NONCE_COOKIE = 'AUTH0_NONCE';

export const authRouter = new Router();

async function localhostLoginPage(req, res) {
  res.redirect('/login/callback');
}

async function productionLoginPage(req, res) {
  const client = getAuth0Client(req);

  const nonce = generators.nonce();

  const authorizationUrl = client.authorizationUrl({
    scope: 'openid email profile',
    nonce,
  });

  res.cookie(AUTH_NONCE_COOKIE, nonce, { maxAge: 300000, path: '/', httpOnly: true });
  res.redirect(authorizationUrl);
}

function getRedirectUrl(req) {
  return `${req.protocol}://${req.get('host')}/login/callback`;
}

async function localhostCallbackPage(req, res) {
  const claims = {
    email: 'test.user@example.com',
  };

  const expirationTime = Date.now() + maxAge;

  const jwt = await new jose.SignJWT(claims)
    .setProtectedHeader({ alg: 'ES256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime(expirationTime)
    .sign(privateKey);

  res.cookie(AUTH_COOKIE, jwt, { maxAge: maxAge * 1000, httpOnly: true, path: '/', secure: false });
  res.clearCookie(REDIRECT_URI_COOKIE);
  res.redirect(req.cookies.UNREED_REDIRECT_URI ?? '/');
}

async function productionCallbackPage(req, res) {
  const nonce = req.cookies[AUTH_NONCE_COOKIE];
  try {
    const client = getAuth0Client(req);
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(getRedirectUrl(req), params, {
      nonce,
    });
    const auth0Claims = tokenSet.claims();

    const claims = {
      email: auth0Claims.email,
    };

    const expirationTime = Date.now() + maxAge;

    const jwt = await new jose.SignJWT(claims)
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setIssuer(issuer)
      .setAudience(audience)
      .setExpirationTime(expirationTime)
      .sign(privateKey);

    res.cookie(AUTH_COOKIE, jwt, {
      maxAge: maxAge * 1000,
      httpOnly: true,
      path: '/',
      secure: true,
    });
    res.clearCookie(REDIRECT_URI_COOKIE);
    res.clearCookie(AUTH_NONCE_COOKIE);
    res.redirect(req.cookies.UNREED_REDIRECT_URI ?? '/');
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error - could not authenticate',
    });
  }
}

if (isDevelopment()) {
  authRouter.get('/login', localhostLoginPage);
  authRouter.get('/login/callback', localhostCallbackPage);
} else {
  authRouter.get('/login', productionLoginPage);
  authRouter.get('/login/callback', productionCallbackPage);
}

export async function authMiddleware(req, res, next) {
  const token = req.cookies[AUTH_COOKIE];
  try {
    if (!token) {
      res.clearCookie('UNREED_USER');
    } else {
      const { payload, protectedHeader } = await jose.jwtVerify(token, privateKeys, {
        issuer,
        audience,
      });
      res.cookie('UNREED_USER', payload.email, { maxAge: maxAge * 1000, httpOnly: false });
      req.user = { email: payload.email };
    }
  } catch (error) {
    console.warn('Failed to validate JWT token', error);
    res.clearCookie(AUTH_COOKIE);
    res.clearCookie('UNREED_USER');
  } finally {
    next();
  }
}
