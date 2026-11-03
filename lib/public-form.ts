export async function readPublicForm(request: Request, maxBytes = 8000): Promise<Record<string, unknown> | null> {
  const reader = request.body?.getReader(); if (!reader) return null;
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > maxBytes) { await reader.cancel(); return null; } chunks.push(value); }
  const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { const result = JSON.parse(new TextDecoder().decode(bytes)); return result && typeof result === "object" && !Array.isArray(result) ? result : null; } catch { return null; }
}
