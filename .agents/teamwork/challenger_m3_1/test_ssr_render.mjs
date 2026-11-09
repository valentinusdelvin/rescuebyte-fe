import { createServer } from 'vite';

async function main() {
  console.log('Testing Vite SSR module loading for SellerReviews.tsx...');
  const server = await createServer();
  try {
    const mod = await server.ssrLoadModule('./src/pages/seller/SellerReviews.tsx');
    if (!mod.SellerReviews && !mod.default) {
      throw new Error('SellerReviews export missing');
    }
    console.log('Vite SSR successfully loaded SellerReviews module without error!');
    console.log('Exported members:', Object.keys(mod));
  } finally {
    await server.close();
  }
}

main().catch((err) => {
  console.error('SSR load failed:', err);
  process.exit(1);
});
