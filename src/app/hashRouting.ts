/** Helper untuk parsing route berbasis hash dan parameter query URL. */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseHash(
  hashStr: string = typeof window !== 'undefined' ? window.location.hash : '',
): { path: string; params: URLSearchParams; anchor?: string } {
  let clean = hashStr.startsWith('#') ? hashStr.slice(1) : hashStr;
  let anchor: string | undefined;

  // Ekstrak secondary anchor jika ada (contoh: #toko?name=abc#ulasan-pelanggan)
  const anchorIndex = clean.lastIndexOf('#');
  if (anchorIndex !== -1) {
    anchor = clean.slice(anchorIndex + 1);
    clean = clean.slice(0, anchorIndex);
  }

  const queryIndex = clean.indexOf('?');
  if (queryIndex === -1) {
    return { path: clean.toLowerCase(), params: new URLSearchParams(), anchor };
  }

  const params = new URLSearchParams(clean.slice(queryIndex + 1));
  if (!anchor && params.has('section')) {
    anchor = params.get('section') || undefined;
  }

  return {
    path: clean.slice(0, queryIndex).toLowerCase(),
    params,
    anchor,
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
