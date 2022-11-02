import { MouseEventHandler, useState } from 'react';
import colors from './colors';
import { Modal } from './ColorPickerModal';
import { findColorHex, getBestContrastColor } from './utils';

export function ColorPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (color: string) => void;
}) {
  const [isSelecting, setIsSelecting] = useState(false);
  function handleOpenerClick() {
    setIsSelecting(true);
  }

  return (
    <>
      <ColorPickerOpener value={value} onClick={handleOpenerClick} />
      {isSelecting ? (
        <ColorPickerModal onClose={() => setIsSelecting(false)} onSelect={onChange} />
      ) : undefined}
    </>
  );
}

function ColorPickerOpener({
  value,
  onClick,
}: {
  value: string | undefined;
  onClick: MouseEventHandler;
}) {
  if (value === undefined) {
    return (
      <button className="color-picker__opener" onClick={onClick}>
        Select a color
      </button>
    );
  } else {
    const subColorHex = findColorHex(value);
    const backgroundColor = subColorHex ?? '#fff';
    const textColor = getBestContrastColor(backgroundColor);

    return (
      <button
        className="color-picker__opener"
        style={{ backgroundColor, color: textColor }}
        onClick={onClick}
      >
        {value}
      </button>
    );
  }
}

function ColorPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (color: string) => void;
  onClose: () => void;
}) {
  const [mainColor, setMainColor] = useState<string | undefined>(undefined);
  if (mainColor === undefined) {
    return (
      <Modal onClose={onClose}>
        <MainColorPicker onSelect={setMainColor} />
      </Modal>
    );
  } else {
    return (
      <Modal onClose={onClose}>
        <SubPicker
          mainColor={mainColor}
          onSelect={(value) => {
            onSelect(value);
            onClose();
          }}
        />
      </Modal>
    );
  }
}

export function MainColorPicker({ onSelect }: { onSelect: (color: string) => void }) {
  return (
    <div className="color-picker__grid">
      {Object.entries(colors).map(([key, data]) => (
        <ColorBlock
          key={key}
          colorName={key}
          backgroundColor={data.sub[key]}
          onClick={() => onSelect(key)}
        />
      ))}
    </div>
  );
}

export function SubPicker({
  mainColor,
  onSelect,
}: {
  mainColor: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div className="color-picker__grid">
      {Object.entries(colors[mainColor].sub).map(([key, code]) => (
        <ColorBlock
          key={key}
          colorName={key}
          backgroundColor={code}
          onClick={() => onSelect(key)}
        />
      ))}
    </div>
  );
}

function ColorBlock({
  colorName,
  backgroundColor,
  onClick,
}: {
  colorName: string;
  backgroundColor: string;
  onClick: MouseEventHandler;
}) {
  const textColor = getBestContrastColor(backgroundColor);
  return (
    <button
      className="color-picker__block"
      style={{
        backgroundColor,
        color: textColor,
      }}
      onClick={onClick}
    >
      {colorName}
    </button>
  );
}
