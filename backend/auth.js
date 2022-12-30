import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import * as jose from 'jose';
import { OAuth2Client } from 'google-auth-library';
import { isDevelopment } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID = '273075937491-eb8o66k7dja2v1og8saorqhqnnc765ct.apps.googleusercontent.com';

let jwks;

const secretsFile = '/secrets/unreed-production';
if (isDevelopment() && fs.existsSync(secretsFile)) {
  console.log(`Loading secrets from ${secretsFile}`);
  const input = fs.readFileSync(secretsFile, 'utf-8');
  const data = JSON.parse(input);
  process.env.DB_HOST = data.DB_HOST;
  process.env.DB_USER = data.DB_USER;
  process.env.DB_PASS = data.DB_PASS;
  process.env.DB_NAME = data.DB_NAME;
  process.env.GOOGLE_CLIENT_SECRET = data.GOOGLE_CLIENT_SECRET;
  jwks = data.JWKS;
} else {
  jwks = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'keys.localhost.json')));
}

const privateKeys = jose.createLocalJWKSet(jwks.public);
const privateKey = await jose.importJWK(jwks.private, 'ES256');

const issuer = `urn:unreed-${isDevelopment() ? 'dev' : 'prod'}:issuer`;
const audience = `urn:unreed-${isDevelopment() ? 'dev' : 'prod'}:audience`;

const maxAge = 2147483647;
const AUTH_COOKIE = 'UNREED_OIDC_TOKEN';
const REDIRECT_URI_COOKIE = 'UNREED_REDIRECT_URI';

export const authRouter = new Router();

async function localhostLoginPage(req, res) {
  res.redirect('/login/callback');
}

async function productionLoginPage(req, res) {
  const client = new OAuth2Client(CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, getRedirectUrl(req));
  const authorizationUrl = client.generateAuthUrl({
    scope: ['openid email'],
    redirect_uri: getRedirectUrl(req),
  });

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

  res.cookie(AUTH_COOKIE, jwt, { maxAge: maxAge * 1000, httpOnly: true, path: '/', secure: true });
  res.clearCookie(REDIRECT_URI_COOKIE);
  res.redirect(req.cookies.UNREED_REDIRECT_URI ?? '/');
}

async function productionCallbackPage(req, res) {
  try {
    const code = req.query.code;
    const client = new OAuth2Client(
      CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      getRedirectUrl(req)
    );
    const googleToken = await client.getToken(code);
    const googleClaims = jose.decodeJwt(googleToken.tokens.id_token);

    const claims = {
      email: googleClaims.email,
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
    res.redirect(req.cookies.UNREED_REDIRECT_URI ?? '/');
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error - could not authenticate',
    });
  }
}

authRouter.get('/login', isDevelopment() ? localhostLoginPage : productionLoginPage);

authRouter.get('/login/callback', isDevelopment() ? localhostCallbackPage : productionCallbackPage);

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
      res.cookie('UNREED_USER', payload.email, { maxAge: 3600, httpOnly: false });
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
