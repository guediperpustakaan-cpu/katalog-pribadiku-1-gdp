/**
 * Helper bersama untuk rute server.
 */
import { DEFAULT_USER_ID } from '../constants.js'

/** ID pengguna (mode pribadi/single-user). */
export function getUserId() {
  return DEFAULT_USER_ID
}

/** Ubah baris hasil query (snake_case) menjadi camelCase. */
export function toCamelCase(row) {
  if (!row) return row
  const output = {}
  Object.entries(row).forEach(([key, value]) => {
    const camel = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    output[camel] = value
  })
  return output
}

/** Ubah array baris menjadi camelCase. */
export function toCamelCaseArray(rows) {
  return (rows ?? []).map(toCamelCase)
}

/** Ubah objek camelCase menjadi snake_case. */
export function toSnakeCase(obj) {
  const output = {}
  Object.entries(obj).forEach(([key, value]) => {
    const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    output[snake] = value
  })
  return output
}

/**
 * Lakukan INSERT dengan aman.
 * @param {string} table - nama tabel
 * @param {object} data - data (camelCase akan dikonversi ke snake_case)
 */
export function buildInsert(table, data) {
  const snake = toSnakeCase(data)
  const columns = Object.keys(snake)
  const values = Object.values(snake)
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
  const columnList = columns.map((c) => `"${c}"`).join(', ')
  const text = `INSERT INTO ${table} (${columnList}) VALUES (${placeholders}) RETURNING *`
  return { text, values }
}

/** Lakukan UPDATE dengan aman. */
export function buildUpdate(table, id, data) {
  const snake = toSnakeCase(data)
  delete snake.id
  delete snake.created_at
  snake.updated_at = new Date().toISOString()

  const columns = Object.keys(snake)
  const values = Object.values(snake)
  const setClause = columns.map((col, i) => `"${col}" = $${i + 1}`).join(', ')
  const text = `UPDATE ${table} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`
  return { text, values: [...values, id] }
}

/** Bungkus handler async agar error langsung masuk ke middleware error. */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
