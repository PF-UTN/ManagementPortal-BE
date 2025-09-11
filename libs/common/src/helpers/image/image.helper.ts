import pRetry from 'p-retry';

export async function urlToBase64(
  url: string,
  mimeType = 'image/png',
): Promise<string> {
  async function fetchImage(): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout

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
  }

  return pRetry(fetchImage, {
    retries: 3,
    factor: 2,
    minTimeout: 500,
  });
}
