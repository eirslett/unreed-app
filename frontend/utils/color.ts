// hsl(from var(--reed-color, black) h s clamp(0, l, 0.7))
// Do the calculation above, but in JS instead of CSS. reedColor is a hex string.
export function clampedBorderColor(reedColorHex: string) {
  const hsl = hexToHsl(reedColorHex);
  const l = Math.min(hsl[2], 0.7);
  return hslToHex([hsl[0], hsl[1], l]);
}

// --clamped-background-color: hsl(from var(--reed-color, black) h s clamp(0.95, l, 1));
// Do the calculation above, but in JS instead of CSS. reedColor is a hex string.
export function clampedBackgroundColor(reedColorHex: string) {
  const hsl = hexToHsl(reedColorHex);
  const l = Math.max(0.95, hsl[2]);
  return hslToHex([hsl[0], hsl[1], l]);
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h, s, l];
}

function hslToHex(hsl: [number, number, number]) {
  const [h, s, l] = hsl;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
