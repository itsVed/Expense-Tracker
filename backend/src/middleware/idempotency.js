const idempotencyStore = new Map(); 

const idempotencyMiddleware = (req, res, next) => {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return next();
  }

  const key = `${req.userId}-${idempotencyKey}`;
  
  if (idempotencyStore.has(key)) {
    const cachedResponse = idempotencyStore.get(key);
    return res
      .status(cachedResponse.status)
      .json(cachedResponse.body);
  }

  const originalJson = res.json;

  res.json = function (body) {
    idempotencyStore.set(key, {
      status: res.statusCode,
      body: body,
    });

    setTimeout(() => {
      idempotencyStore.delete(key);
    }, 24 * 60 * 60 * 1000);

    return originalJson.call(this, body);
  };

  next();
};

module.exports = idempotencyMiddleware;
