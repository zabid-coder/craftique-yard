// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', { id: text('id').primaryKey(), payload: text('payload').notNull(), updatedAt: text('updated_at').notNull() });
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(), reference: text('reference').notNull().unique(), checkoutKey: text('checkout_key').notNull().unique(), payload: text('payload').notNull(),
  status: text('status').notNull().default('pending'), paymentStatus: text('payment_status').notNull().default('unpaid'), createdAt: text('created_at').notNull(), updatedAt: text('updated_at').notNull(),
});
export const settings = sqliteTable('settings', { key: text('key').primaryKey(), payload: text('payload').notNull() });
export const rateLimits = sqliteTable('rate_limits', { key: text('key').primaryKey(), count: integer('count').notNull(), expiresAt: integer('expires_at').notNull() });
