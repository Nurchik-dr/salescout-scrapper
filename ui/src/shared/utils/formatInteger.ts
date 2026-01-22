export const formatNumber = (value: number) =>
  new Intl.NumberFormat('ru-RU').format(value);