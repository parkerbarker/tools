// KV Key-Value Store Demo - Persistent Counter
// Route: /api/demo/kv
// Binding: env.DEMO_KV

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const COUNTER_KEY = 'demo_counter';
const COUNTER_METADATA_KEY = 'demo_counter_meta';

export async function onRequest(context) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  
  // Check if KV is bound
  if (!env.DEMO_KV) {
    return new Response(
      JSON.stringify({
        error: 'KV not configured',
        hint: 'Run scripts/setup.sh and update wrangler.toml with your namespace IDs',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
  
  try {
    const url = new URL(request.url);
    
    // GET - Read current counter value
    if (request.method === 'GET') {
      const value = await env.DEMO_KV.get(COUNTER_KEY);
      const metadata = await env.DEMO_KV.get(COUNTER_METADATA_KEY, { type: 'json' });
      
      return new Response(
        JSON.stringify({
          counter: parseInt(value) || 0,
          metadata: metadata || { created: null, lastUpdated: null },
          storage: 'KV (Key-Value)',
        }),
        {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    // POST - Increment counter (or set custom value)
    if (request.method === 'POST') {
      let body = {};
      try {
        body = await request.json();
      } catch {
        // No body is fine - just increment
      }
      
      const currentValue = parseInt(await env.DEMO_KV.get(COUNTER_KEY)) || 0;
      const increment = body.increment || 1;
      const newValue = body.set !== undefined ? body.set : currentValue + increment;
      
      // Get or create metadata
      let metadata = await env.DEMO_KV.get(COUNTER_METADATA_KEY, { type: 'json' }) || {};
      if (!metadata.created) {
        metadata.created = new Date().toISOString();
      }
      metadata.lastUpdated = new Date().toISOString();
      metadata.updateCount = (metadata.updateCount || 0) + 1;
      
      // Store counter value
      // Optional: Set TTL (expiration) - uncomment to auto-expire after 1 hour
      // await env.DEMO_KV.put(COUNTER_KEY, String(newValue), { expirationTtl: 3600 });
      await env.DEMO_KV.put(COUNTER_KEY, String(newValue));
      await env.DEMO_KV.put(COUNTER_METADATA_KEY, JSON.stringify(metadata));
      
      return new Response(
        JSON.stringify({
          counter: newValue,
          previousValue: currentValue,
          change: newValue - currentValue,
          metadata,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    // DELETE - Reset counter
    if (request.method === 'DELETE') {
      await env.DEMO_KV.delete(COUNTER_KEY);
      await env.DEMO_KV.delete(COUNTER_METADATA_KEY);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Counter reset to 0',
          counter: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'KV error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
}
