/**
 * GET /api/me
 *
 * Returns the current user's identity parsed from the SWA
 * x-ms-client-principal header. Useful for debugging / profile display.
 *
 * Response: { email, name, userId } or 401 if unauthenticated.
 */

'use strict';

const { app } = require('@azure/functions');

app.http('get-me', {
  methods:   ['GET'],
  authLevel: 'anonymous',
  route:     'me',
  handler:   async (req, ctx) => {
    const principal = parsePrincipal(req.headers.get('x-ms-client-principal'));

    if (!principal) {
      return {
        status:  401,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ error: 'Not authenticated' }),
      };
    }

    return {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(principal),
    };
  },
});

/**
 * Parse the base64-encoded x-ms-client-principal header injected by SWA.
 */
function parsePrincipal(header) {
  if (!header) return null;
  try {
    const json = Buffer.from(header, 'base64').toString('utf8');
    const obj  = JSON.parse(json);
    if (!obj?.userDetails) return null;

    const claims = obj.claims ?? [];
    return {
      email:    getClaimVal(claims, 'preferred_username')
             ?? getClaimVal(claims, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress')
             ?? obj.userDetails,
      name:     getClaimVal(claims, 'name') ?? obj.userDetails,
      userId:   getClaimVal(claims, 'oid')  ?? obj.userId,
      provider: obj.identityProvider,
    };
  } catch {
    return null;
  }
}

function getClaimVal(claims, typ) {
  return claims.find(c => c.typ === typ)?.val ?? null;
}

module.exports = { parsePrincipal };
