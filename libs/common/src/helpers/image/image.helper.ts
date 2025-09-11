export async function urlToBase64(
  url: string,
  mimeType = 'image/png',
  retries = 3,
  delay = 500,
): Promise<string> {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(
            `Failed to fetch ${url}: ${res.status} ${res.statusText}`,
          );
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        return `data:${mimeType};base64,${buffer.toString('base64')}`;
      } finally {
        clearTimeout(timeout);
      }
    },
    retries,
    delay,
  );
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500,
  factor = 2,
): Promise<T> {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
        delay *= factor; // exponential backoff
      }
    }
  }

  throw lastError;
}
