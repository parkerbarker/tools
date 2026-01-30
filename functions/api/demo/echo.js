// Echo endpoint - transforms and returns POST data
// Route: /api/demo/echo

export async function onRequest(context) {
  const { request } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'POST required. Send JSON body to echo.' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
  
  try {
    const body = await request.json();
    
    // Transform the data server-side
    const transformed = {
      received: body,
      transformations: {
        uppercase: typeof body.text === 'string' ? body.text.toUpperCase() : null,
        reversed: typeof body.text === 'string' ? body.text.split('').reverse().join('') : null,
        wordCount: typeof body.text === 'string' ? body.text.split(/\s+/).filter(Boolean).length : null,
        charCount: typeof body.text === 'string' ? body.text.length : null,
      },
      processedAt: new Date().toISOString(),
      processedBy: 'Cloudflare Worker',
    };
    
    return new Response(JSON.stringify(transformed, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body', details: e.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
