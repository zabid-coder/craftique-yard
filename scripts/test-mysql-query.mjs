import assert from 'node:assert/strict';
import { mysqlQuery } from '../app/lib/sql-compat.ts';

assert.equal(
  mysqlQuery("SELECT * FROM orders WHERE reference=? AND json_extract(payload,'$.phone')=?"),
  "SELECT * FROM orders WHERE reference=? AND JSON_UNQUOTE(JSON_EXTRACT(payload,'$.phone'))=?",
  'Track order phone lookup must unquote JSON_EXTRACT for MySQL'
);

assert.equal(
  mysqlQuery("SELECT reference FROM orders WHERE json_extract(payload,'$.customerEmail')=?"),
  "SELECT reference FROM orders WHERE JSON_UNQUOTE(JSON_EXTRACT(payload,'$.customerEmail'))=?",
  'Customer email lookup must unquote JSON_EXTRACT for MySQL'
);

assert.equal(
  mysqlQuery('INSERT INTO settings(key,payload) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload'),
  'INSERT INTO settings(`key`,payload) VALUES(?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)',
  'Settings upsert and key escaping preserved'
);

assert.equal(
  mysqlQuery("UPDATE orders SET status=?,payment_status=?,payload=json_set(payload,'$.staffNote',?,'$.transactionRef',?),updated_at=? WHERE id=?"),
  "UPDATE orders SET status=?,payment_status=?,payload=json_set(payload,'$.staffNote',?,'$.transactionRef',?),updated_at=? WHERE id=?",
  'JSON_SET update query preserved'
);

console.log('PASS all MySQL query compatibility checks');
