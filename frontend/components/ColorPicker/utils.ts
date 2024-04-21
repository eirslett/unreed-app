import { colors } from './colors';

export function findColorHex(colorName: string): string | undefined {
  for (const mainColor of Object.keys(colors)) {
    for (const subColor of Object.keys(colors[mainColor].sub)) {
      if (subColor === colorName) {
        return colors[mainColor].sub[subColor];
      }
    }
  }
  return undefined;
}

// Check if black or white is the best text color for the specified background color
export function getBestContrastColor(backgroundColor: string) {
  const color = backgroundColor.substring(1); // strip #
  const rgb = parseInt(color, 16); // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff; // extract red
  const g = (rgb >> 8) & 0xff; // extract green
  const b = (rgb >> 0) & 0xff; // extract blue

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma < 186 ? '#fff' : '#000';
}
