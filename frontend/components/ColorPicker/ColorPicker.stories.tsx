import { ColorPicker, MainColorPicker, SubPicker } from './ColorPicker';
import { useState } from 'react';

export default {
  title: 'Color Picker',
};

export function WithChosenValue() {
  const [value, setValue] = useState<string | undefined>('medallion');
  return <ColorPicker value={value} onChange={setValue} />;
}

export function WithNoColorSelected() {
  const [value, setValue] = useState<string | undefined>(undefined);
  return <ColorPicker value={value} onChange={setValue} />;
}

export function MainColorExample() {
  return <MainColorPicker onSelect={console.log} />;
}

export function SubPickerExample() {
  return <SubPicker mainColor="yellow" onSelect={console.log} />;
}

export function SubPickerBlacks() {
  return <SubPicker mainColor="black" onSelect={console.log} />;
}
