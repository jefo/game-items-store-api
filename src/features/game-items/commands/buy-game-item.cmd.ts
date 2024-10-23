import { ICmd } from "../../../lib/cqrs";
import { db } from "../../../lib/db";
import { BuyGameItemReqType } from "./buy-game-item.dto";

interface Item {
  id: string;
  price: number;
  stock: number;
}

export class BuyGameItemCommand implements ICmd<BuyGameItemReqType> {
  async execute({ userId, itemId }: BuyGameItemReqType): Promise<void> {
    const client = await db.getClient();

    try {
      await client.query("BEGIN");

      // Get current item state with FOR UPDATE to lock the row
      const itemResult = await client.query(
        `SELECT id, price, stock 
         FROM items 
         WHERE id = $1 
         FOR UPDATE`,
        [itemId]
      );

      if (itemResult.rowCount === 0) {
        throw new Error("Item not found");
      }

      const item = itemResult.rows[0];

      if (item.stock <= 0) {
        throw new Error("Item out of stock");
      }

      // Get current user balance with FOR UPDATE to lock the row
      const userResult = await client.query(
        `SELECT balance 
         FROM users 
         WHERE id = $1 
         FOR UPDATE`,
        [userId]
      );

      if (userResult.rowCount === 0) {
        throw new Error("User not found");
      }

      const user = userResult.rows[0];

      if (user.balance < item.price) {
        throw new Error("Insufficient balance");
      }

      // Update user balance
      await client.query(
        `UPDATE users 
         SET balance = balance - $1
         WHERE id = $2`,
        [item.price, userId]
      );

      // Update item stock
      await client.query(
        `UPDATE items 
         SET stock = stock - 1
         WHERE id = $1 
         AND stock > 0`,
        [itemId]
      );

      // Create purchase record
      await client.query(
        `INSERT INTO purchases (
          user_id, 
          item_id, 
          quantity, 
          purchase_date
        ) VALUES ($1, $2, $3, $4)`,
        [userId, itemId, 1, new Date()]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

export const BuyGameItemCommandType = Symbol("BuyGameItemCommand");
