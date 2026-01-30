// Server-side time endpoint
// Route: /api/demo/time

export async function onRequest(context) {
  const now = new Date();
  
  return new Response(
    JSON.stringify({
      iso: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
      utc: now.toUTCString(),
      timezone: 'UTC (Workers run in UTC)',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
