export interface SSEEvent {
  type: string;
  [key: string]: unknown;
}

/**
 * Incrementally parses an SSE (text/event-stream) response body.
 * Replaces re-splitting the *entire* accumulated buffer on every chunk
 * (O(n) of the whole buffer, every chunk) with an index-tracked scan that
 * only processes newly-arrived bytes.
 */
export async function readSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (evt: SSEEvent) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) return;

    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);

      if (!line.startsWith('data: ')) continue;
      try {
        onEvent(JSON.parse(line.slice(6)));
      } catch {
        // skip malformed event chunks
      }
    }
  }
}
