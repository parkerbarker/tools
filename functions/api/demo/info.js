// Request info endpoint - shows Cloudflare's edge data
// Route: /api/demo/info

export async function onRequest(context) {
  const { request } = context;
  
  // Cloudflare adds a 'cf' object to requests with geo/network info
  const cf = request.cf || {};
  
  return new Response(
    JSON.stringify({
      // Request basics
      method: request.method,
      url: request.url,
      
      // Cloudflare edge location info (available in production)
      edge: {
        colo: cf.colo || 'N/A (local dev)',           // Cloudflare datacenter code
        country: cf.country || 'N/A',                  // Country code
        city: cf.city || 'N/A',                        // City name
        region: cf.region || 'N/A',                    // Region/state
        timezone: cf.timezone || 'N/A',                // Visitor timezone
        latitude: cf.latitude || 'N/A',
        longitude: cf.longitude || 'N/A',
      },
      
      // Connection info
      connection: {
        httpProtocol: cf.httpProtocol || 'N/A',       // HTTP/1.1, HTTP/2, HTTP/3
        tlsVersion: cf.tlsVersion || 'N/A',           // TLS version
        asn: cf.asn || 'N/A',                         // Autonomous System Number
        asOrganization: cf.asOrganization || 'N/A',   // ISP name
      },
      
      // Select headers
      headers: {
        userAgent: request.headers.get('user-agent'),
        acceptLanguage: request.headers.get('accept-language'),
        referer: request.headers.get('referer'),
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
