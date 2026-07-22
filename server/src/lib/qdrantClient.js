import { QdrantClient } from '@qdrant/js-client-rest'
import { config } from '../config.js'

const client = new QdrantClient({
  url: config.qdrant.url,
  apiKey: config.qdrant.apiKey,
  checkCompatibility: false,
})

export function collectionNameFor(sessionId) {
  return `${config.qdrant.collectionPrefix}${sessionId}`
}

/**
 * Create the session's collection if it doesn't exist yet. Vector size is
 * only known once we've embedded something with the embedding model, so
 * callers pass it in rather than us guessing a fixed dimension.
 */
export async function ensureCollection(collectionName, vectorSize) {
  const { collections } = await client.getCollections()
  const exists = collections.some((c) => c.name === collectionName)
  if (exists) return

  await client.createCollection(collectionName, {
    vectors: {
      size: vectorSize,
      distance: 'Cosine',
    },
  })
}

/**
 * Replace any existing points for this session with a fresh set. We keep
 * one document "live" per session at a time, so a new upload should
 * supersede whatever was indexed before rather than mixing content.
 */
export async function recreateCollection(collectionName, vectorSize) {
  const { collections } = await client.getCollections()
  const exists = collections.some((c) => c.name === collectionName)
  if (exists) {
    await client.deleteCollection(collectionName)
  }
  await client.createCollection(collectionName, {
    vectors: {
      size: vectorSize,
      distance: 'Cosine',
    },
  })
}

export async function upsertChunks(collectionName, points) {
  await client.upsert(collectionName, {
    wait: true,
    points,
  })
}

/**
 * @returns {Promise<Array<{score: number, payload: object}>>}
 */
export async function search(collectionName, vector, { limit, scoreThreshold } = {}) {
  const result = await client.search(collectionName, {
    vector,
    limit: limit ?? config.retrieval.topK,
    score_threshold: scoreThreshold,
    with_payload: true,
  })
  return result
}

export async function collectionExists(collectionName) {
  try {
    const { collections } = await client.getCollections()
    return collections.some((c) => c.name === collectionName)
  } catch {
    return false
  }
}

export async function deleteCollectionIfExists(collectionName) {
  if (await collectionExists(collectionName)) {
    await client.deleteCollection(collectionName)
  }
}
