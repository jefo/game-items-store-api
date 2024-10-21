import { ICmd } from "../../../lib/cqrs";
import { db } from "../../../lib/db";
import { BuyGameItemReqType } from "./buy-game-item.dto";
import { DataCache } from "../../../lib/caching/data-cache";

interface Item {
  id: string;
  price: number;
  version: number;
}

const CACHE_TTL = 60 * 5; // 5 minutes

// TODO: create CACHED query for GetItemQueryById
export class BuyGameItemCommand implements ICmd<BuyGameItemReqType> {
  constructor(private readonly cache: DataCache) {}

  async execute({ userId, itemId }: BuyGameItemReqType): Promise<void> {
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Get item details from cache or database
      const itemCacheKey = { key: `item:${itemId}` };
      let item = await this.cache.get<typeof itemCacheKey, Item>(itemCacheKey);
      if (!item) {
        const itemResult = await client.query('SELECT id, price, version FROM items WHERE id = $1', [itemId]);
        item = itemResult.rows[0] as Item;
        if (item) {
          await this.cache.set(itemCacheKey, item, CACHE_TTL);
        }
      }

      if (!item) {
        throw new Error('Item not found');
      }

      // Use a single query to check user balance and update it atomically with optimistic locking
      const result = await client.query(
        `UPDATE users 
         SET balance = balance - $1, version = version + 1
         WHERE id = $2 AND balance >= $1 AND version = $3
         RETURNING *`,
        [item.price, userId, item.version]
      );

      if (result.rowCount === 0) {
        throw new Error('Insufficient balance or concurrent modification detected');
      }

      // Create purchase record
      await client.query(
        'INSERT INTO purchases (user_id, item_id, price, purchased_at) VALUES ($1, $2, $3, $4)',
        [userId, itemId, item.price, new Date()]
      );

      // Update item version
      await client.query(
        'UPDATE items SET version = version + 1 WHERE id = $1',
        [itemId]
      );

      await client.query('COMMIT');

      // Invalidate cache
      await this.cache.del(itemCacheKey);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

export const BuyGameItemCommandType = Symbol('BuyGameItemCommand');
