// Random data generator endpoint
// Route: /api/demo/random

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Get parameters
  const count = Math.min(parseInt(url.searchParams.get('count')) || 5, 100);
  const type = url.searchParams.get('type') || 'numbers';
  
  let data;
  
  switch (type) {
    case 'uuid':
      data = Array.from({ length: count }, () => crypto.randomUUID());
      break;
      
    case 'hex':
      data = Array.from({ length: count }, () => {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      });
      break;
      
    case 'dice':
      data = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
      break;
      
    case 'coin':
      data = Array.from({ length: count }, () => Math.random() < 0.5 ? 'heads' : 'tails');
      break;
      
    case 'numbers':
    default:
      const min = parseInt(url.searchParams.get('min')) || 1;
      const max = parseInt(url.searchParams.get('max')) || 100;
      data = Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
      );
      break;
  }
  
  return new Response(
    JSON.stringify({
      type,
      count: data.length,
      data,
      generatedAt: new Date().toISOString(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store', // Don't cache random data
      },
    }
  );
}
