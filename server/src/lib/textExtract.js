import mammoth from 'mammoth'

// pdf-parse ships a debug entry point at its package root that tries to
// read a test fixture on import in some versions — importing the lib
// directly avoids that.
import pdfParse from 'pdf-parse/lib/pdf-parse.js'

const SUPPORTED = {
  'application/pdf': extractPdf,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extractDocx,
  'text/plain': extractPlainText,
  'text/markdown': extractPlainText,
}

export function isSupportedFile(mimetype) {
  return Object.prototype.hasOwnProperty.call(SUPPORTED, mimetype)
}

export function supportedExtensionsLabel() {
  return 'PDF, DOCX, TXT, or MD'
}

/**
 * @param {Buffer} buffer
 * @param {string} mimetype
 * @returns {Promise<string>} extracted plain text
 */
export async function extractText(buffer, mimetype) {
  const handler = SUPPORTED[mimetype]
  if (!handler) {
    throw new Error(`Unsupported file type: ${mimetype}`)
  }
  const text = await handler(buffer)
  return text.replace(/\r\n/g, '\n').trim()
}

async function extractPdf(buffer) {
  const data = await pdfParse(buffer)
  return data.text
}

async function extractDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer })
  return value
}

async function extractPlainText(buffer) {
  return buffer.toString('utf-8')
}
