export function timestampToLocaleFormattedDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString();
}
