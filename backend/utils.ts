import process from 'process';

export function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}
