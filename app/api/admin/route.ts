import { z } from 'zod';
import { baseProductIds, applyProductPosition } from '../../lib/catalog';
import {
  readJson,
  database,
  getProducts,
  getProductOrder,
  saveProductOrder,
  getSettings,
  isAdmin,
  checkOrigin,
  json,
  productSchema,
  settingsSchema,
} from '../../lib/store';

export async function GET() {
  if (!(await isAdmin())) return json({ error: 'Admin access required.' }, 403);
  try {
    const [products, settings, orders] = await Promise.all([
      getProducts(true),
      getSettings(),
      database().prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000').all(),
    ]);
    return json({
      products,
      settings,
      baseProductIds: [...baseProductIds],
      orders: orders.results.map((r: any) => ({ ...r, ...JSON.parse(r.payload), payload: undefined })),
    });
  } catch {
    return json({ error: 'Dashboard data unavailable.' }, 503);
  }
}

export async function POST(request: Request) {
  if (!checkOrigin(request) || !(await isAdmin())) {
    return json({ error: 'Admin access required.' }, 403);
  }
  try {
    const data = await readJson(request);

    if (data.action === 'product') {
      const p = productSchema.parse(data.product);
      const position =
        data.position !== undefined
          ? z.number().int().min(1).max(5000).parse(data.position)
          : undefined;
      await database()
        .prepare(
          'INSERT INTO products(id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at'
        )
        .bind(p.id, JSON.stringify(p), new Date().toISOString())
        .run();

      if (position !== undefined) {
        const currentIds = (await getProducts(true)).map((item) => item.id);
        await saveProductOrder(applyProductPosition(currentIds, p.id, position));
      }
      return json({ ok: true });
    }

    if (data.action === 'reorder') {
      const { order } = z
        .object({ order: z.array(productSchema.shape.id).min(1).max(5000) })
        .parse(data);
      await saveProductOrder(order);
      return json({ ok: true });
    }

    if (data.action === 'deleteProduct') {
      const { id } = z.object({ id: productSchema.shape.id }).parse(data);
      if (baseProductIds.has(id)) {
        return json(
          { error: 'Built-in catalog products cannot be deleted. Turn off "Show on website" to hide them.' },
          400
        );
      }
      const result = await database().prepare('DELETE FROM products WHERE id=?').bind(id).run();
      if (!result.meta.changes) return json({ error: 'Product not found.' }, 404);
      const existingOrder = await getProductOrder();
      if (existingOrder && existingOrder.includes(id)) {
        await saveProductOrder(existingOrder.filter((item) => item !== id));
      }
      return json({ ok: true });
    }

    if (data.action === 'settings') {
      const s = settingsSchema.parse(data.settings);
      await database()
        .prepare('INSERT INTO settings(key,payload) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload')
        .bind('store', JSON.stringify(s))
        .run();
      return json({ ok: true });
    }

    if (data.action === 'order') {
      const d = z
        .object({
          id: z.string().uuid(),
          status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
          paymentStatus: z.enum(['unpaid', 'verification_pending', 'paid', 'refunded']),
          transactionRef: z.string().max(100),
          staffNote: z.string().max(1500),
        })
        .parse(data.order);
      const result = await database()
        .prepare(
          "UPDATE orders SET status=?,payment_status=?,payload=json_set(payload,'$.staffNote',?,'$.transactionRef',?),updated_at=? WHERE id=?"
        )
        .bind(d.status, d.paymentStatus, d.staffNote, d.transactionRef, new Date().toISOString(), d.id)
        .run();
      if (!result.meta.changes) return json({ error: 'Order not found.' }, 404);
      return json({ ok: true });
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch {
    return json({ error: 'Check the values and try again.' }, 400);
  }
}
