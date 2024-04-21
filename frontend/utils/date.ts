export function timestampToLocaleFormattedDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString();
}
