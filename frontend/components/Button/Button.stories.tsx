import { Button } from './Button';

export default {
  title: 'Button',
};

export function Primary() {
  return <Button variant="primary">Primary</Button>;
}

export function Warning() {
  return <Button variant="warning">Warning</Button>;
}
