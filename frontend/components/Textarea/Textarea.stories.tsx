import { useState } from 'react';
import { Textarea } from './Textarea';

export default {
  title: 'Textarea',
};

export function Autogrowing() {
  const [value, setValue] = useState('Test\n\nABC\n123456');
  return <Textarea value={value} onChange={(ev) => setValue(ev.target.value)} />;
}
