/**
 * Converts SQLite-style queries in API routes into MySQL-compatible SQL.
 */
export function mysqlQuery(query: string): string {
  return query
    .replace(
      /ON CONFLICT\(id\) DO UPDATE SET payload=excluded\.payload,updated_at=excluded\.updated_at/g,
      'ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated_at=VALUES(updated_at)'
    )
    .replace(
      /ON CONFLICT\(key\) DO UPDATE SET payload=excluded\.payload/g,
      'ON DUPLICATE KEY UPDATE payload=VALUES(payload)'
    )
    .replace(
      /ON CONFLICT\(checkout_key\) DO NOTHING/g,
      'ON DUPLICATE KEY UPDATE checkout_key=checkout_key'
    )
    .replace(
      /\bjson_extract\(([^,]+),\s*('[^']+')\)/gi,
      'JSON_UNQUOTE(JSON_EXTRACT($1,$2))'
    )
    .replace(/\bkey\b/g, '`key`');
}
