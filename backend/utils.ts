import process from 'process';

export function isDevelopment() {
  console.log('the env is', process.env.NODE_ENV);
  return process.env.NODE_ENV !== 'production';
}
