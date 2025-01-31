export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatCurrency(currencyPrefix: string, value: number): string {
  const decimal = (value % 1).toFixed(2);
  const integer = Math.trunc(value);
  if (integer <= 0) {
    if (decimal === '0.00') {
      return `${currencyPrefix} ${value}`;
    }
  }

  const result = `${currencyPrefix} ${integer}.${decimal}`;
  return result.replace('.0', '');
}
