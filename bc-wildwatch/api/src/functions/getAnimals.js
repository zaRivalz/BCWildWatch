/**
 * GET /api/get-animals
 *
 * Returns the list of animals from the Dataverse bcw_animal table.
 * Response: [{ id: string, name: string }, ...]
 *
 * Protected by SWA — only authenticated users can reach /api/* routes.
 */

'use strict';

const { app } = require('@azure/functions');
const { getAnimals } = require('./dataverseClient');

app.http('get-animals', {
  methods:   ['GET'],
  authLevel: 'anonymous', // Auth enforced by staticwebapp.config.json routing rules
  route:     'get-animals',
  handler:   async (req, ctx) => {
    ctx.log('get-animals invoked');

    try {
      const animals = await getAnimals();

      return {
        status:  200,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(animals),
      };

    } catch (err) {
      ctx.log.error('get-animals error:', err.message);
      return {
        status:  500,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ error: 'Failed to load animals. Please try again.' }),
      };
    }
  },
});
