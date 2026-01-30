// Example Cloudflare Pages Function
// Route: /api/hello
// Docs: https://developers.cloudflare.com/pages/functions/

export async function onRequest(context) {
  // context includes: request, env, params, waitUntil, next, data
  const { request } = context;
  
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || 'World';
  
  return new Response(
    JSON.stringify({
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
      method: request.method,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
