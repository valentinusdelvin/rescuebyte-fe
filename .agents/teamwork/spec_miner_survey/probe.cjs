const https = require('https');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const u = new URL('https://dolpin-fourthree.bccdev.id' + path);
    const postData = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }
    const options = {
      method,
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      headers: reqHeaders
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runProbes() {
  const validStoreId = '01a18db0-c24a-736f-8087-3ec00263311a';
  const validProdId = '01a18db1-3ef4-7844-9da6-4a4612d30834';
  const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
  const invalidUuid = 'not-a-uuid';

  const probes = [
    // 1. GET product reviews
    { name: 'GET product reviews (valid)', m: 'GET', p: '/api/v1/products/' + validProdId + '/reviews?page=1&limit=5' },
    { name: 'GET product reviews (no params)', m: 'GET', p: '/api/v1/products/' + validProdId + '/reviews' },
    { name: 'GET product reviews (page=0)', m: 'GET', p: '/api/v1/products/' + validProdId + '/reviews?page=0&limit=5' },
    { name: 'GET product reviews (invalid limit - negative)', m: 'GET', p: '/api/v1/products/' + validProdId + '/reviews?page=1&limit=-1' },
    { name: 'GET product reviews (nonexistent product UUID)', m: 'GET', p: '/api/v1/products/' + nonExistentUuid + '/reviews' },
    { name: 'GET product reviews (malformed UUID)', m: 'GET', p: '/api/v1/products/' + invalidUuid + '/reviews' },

    // 2. GET store reviews
    { name: 'GET store reviews (valid)', m: 'GET', p: '/api/v1/stores/' + validStoreId + '/reviews?page=1&limit=5' },
    { name: 'GET store reviews (no params)', m: 'GET', p: '/api/v1/stores/' + validStoreId + '/reviews' },
    { name: 'GET store reviews (nonexistent store UUID)', m: 'GET', p: '/api/v1/stores/' + nonExistentUuid + '/reviews' },
    { name: 'GET store reviews (malformed UUID)', m: 'GET', p: '/api/v1/stores/' + invalidUuid + '/reviews' },

    // 3. GET store summary
    { name: 'GET store summary (valid)', m: 'GET', p: '/api/v1/stores/' + validStoreId + '/summary' },
    { name: 'GET store summary (nonexistent store UUID)', m: 'GET', p: '/api/v1/stores/' + nonExistentUuid + '/summary' },
    { name: 'GET store summary (malformed UUID)', m: 'GET', p: '/api/v1/stores/' + invalidUuid + '/summary' },

    // 4. POST product review without auth
    { name: 'POST product review (no auth)', m: 'POST', p: '/api/v1/products/' + validProdId + '/reviews', b: { rating: 5, content: 'Enak banget!' } },
    { name: 'POST product review (malformed UUID, no auth)', m: 'POST', p: '/api/v1/products/' + invalidUuid + '/reviews', b: { rating: 5, content: 'Enak banget!' } },

    // 5. POST store review without auth
    { name: 'POST store review (no auth)', m: 'POST', p: '/api/v1/stores/' + validStoreId + '/reviews', b: { rating: 4, content: 'Pelayanan ramah' } },

    // 6. PATCH review without auth
    { name: 'PATCH review (no auth)', m: 'PATCH', p: '/api/v1/reviews/' + validProdId, b: { rating: 3, content: 'Update review' } },
    { name: 'PATCH review (malformed UUID, no auth)', m: 'PATCH', p: '/api/v1/reviews/' + invalidUuid, b: { rating: 3, content: 'Update review' } },

    // 7. DELETE review without auth
    { name: 'DELETE review (no auth)', m: 'DELETE', p: '/api/v1/reviews/' + validProdId },
    { name: 'DELETE review (malformed UUID, no auth)', m: 'DELETE', p: '/api/v1/reviews/' + invalidUuid },
  ];

  for (const pr of probes) {
    const res = await request(pr.m, pr.p, pr.b);
    console.log(`=== ${pr.name} ===`);
    console.log(`Status: ${res.status}`);
    console.log(`Body:`, JSON.stringify(res.body || res.raw));
  }
}

runProbes();
