const idempotencyStore = new Map(); // In production, use Redis

const idempotencyMiddleware = (req, res, next) => {
  // Only apply to POST, PUT, DELETE requests
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return next();
  }

  // Check if request was already processed
  const key = `${req.userId}-${idempotencyKey}`;
  
  if (idempotencyStore.has(key)) {
    const cachedResponse = idempotencyStore.get(key);
    return res
      .status(cachedResponse.status)
      .json(cachedResponse.body);
  }

  // Store original json method
  const originalJson = res.json;

  // Override json method to cache response
  res.json = function (body) {
    idempotencyStore.set(key, {
      status: res.statusCode,
      body: body,
    });

    // Clean up cache after 24 hours
    setTimeout(() => {
      idempotencyStore.delete(key);
    }, 24 * 60 * 60 * 1000);

    return originalJson.call(this, body);
  };

  next();
};

module.exports = idempotencyMiddleware;
