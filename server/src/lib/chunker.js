/**
 * Split text into overlapping, roughly-sized chunks along paragraph and
 * sentence boundaries where possible, so retrieval doesn't hand the model
 * a passage cut off mid-sentence any more than necessary.
 *
 * @param {string} text
 * @param {{chunkSize?: number, overlap?: number}} opts
 * @returns {string[]}
 */
export function chunkText(text, { chunkSize = 1200, overlap = 150 } = {}) {
  const normalized = text.replace(/\n{3,}/g, '\n\n').trim()
  if (!normalized) return []

  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  const chunks = []
  let current = ''

  const pushCurrent = () => {
    const trimmed = current.trim()
    if (trimmed) chunks.push(trimmed)
    current = ''
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length > chunkSize) {
      // A single paragraph bigger than the target size — split it on
      // sentence boundaries instead of dropping it.
      const sentences = paragraph.split(/(?<=[.!?])\s+/)
      for (const sentence of sentences) {
        if ((current + ' ' + sentence).trim().length > chunkSize) {
          pushCurrent()
        }
        current = `${current} ${sentence}`.trim()
      }
      continue
    }

    if ((current + '\n\n' + paragraph).trim().length > chunkSize) {
      pushCurrent()
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph
  }
  pushCurrent()

  if (overlap <= 0 || chunks.length < 2) return chunks

  // Stitch a small tail of each chunk onto the front of the next one so
  // context isn't lost right at a chunk boundary.
  const withOverlap = [chunks[0]]
  for (let i = 1; i < chunks.length; i++) {
    const prevTail = chunks[i - 1].slice(-overlap)
    withOverlap.push(`${prevTail}\n\n${chunks[i]}`)
  }
  return withOverlap
}
