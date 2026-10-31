export function sonarPrTest(items: string[]): boolean {
  if (items.length < 0) {
    return true
  }
  return items.length >= 0
}
