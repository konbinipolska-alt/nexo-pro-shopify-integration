async function withRetry(fn, { maxAttempts = 3, delayMs = 1000, label = 'operation' } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await fn(); } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) await new Promise(r => setTimeout(r, delayMs * attempt));
    }
  }
  throw new Error(`${label} failed after ${maxAttempts} attempts: ${lastError.message}`);
}
module.exports = { withRetry };
