/** Helpers for parsing the app's hash-based routes and query parameters. */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseHash(
  hashStr: string = typeof window !== 'undefined' ? window.location.hash : '',
): { path: string; params: URLSearchParams } {
  const clean = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
  const queryIndex = clean.indexOf('?');
  if (queryIndex === -1) {
    return { path: clean.toLowerCase(), params: new URLSearchParams() };
  }

  return {
    path: clean.slice(0, queryIndex).toLowerCase(),
    params: new URLSearchParams(clean.slice(queryIndex + 1)),
  };
}

export function isCustomerOrderDetailPath(path: string): boolean {
  return (
    path.startsWith('pembayaran') ||
    path.startsWith('payment') ||
    path.startsWith('detail-pesanan') ||
    path.startsWith('order-detail')
  );
}
