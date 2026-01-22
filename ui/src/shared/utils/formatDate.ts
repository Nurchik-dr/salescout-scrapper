export function formatDateAndTime(
  isoDate: string,
  locale: string = 'ru-RU'
): string {
  const date = new Date(isoDate);

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
