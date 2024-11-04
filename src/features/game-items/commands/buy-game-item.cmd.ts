import {
  key,
  provider,
  register,
  singleton,
  inject,
  by,
} from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { Pool } from "pg";
import { BuyGameItemReqType } from "./buy-game-item.dto";
import { BuyGameItemCmdType } from "./types";
import { NotFoundError, ValidationError } from "../../../lib/errors";

export interface PurchaseResult {
  purchase: {
    id: number;
    item_name: string;
    price: number;
    created_at: string;
  };
  updatedBalance: number;
}

@register(key(BuyGameItemCmdType))
@provider(singleton())
export class BuyGameItemCmd
  implements ICmd<BuyGameItemReqType, PurchaseResult>
{
  constructor(@inject(by.key("DbPool")) private db: Pool) {}

  async execute({
    userId,
    itemId,
    isTradable,
  }: BuyGameItemReqType): Promise<PurchaseResult> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      // Get current item state with FOR UPDATE to lock the row
      const itemResult = await client.query(
        `SELECT id, name, tradable_price, non_tradable_price 
         FROM game_items 
         WHERE id = $1 
         FOR UPDATE`,
        [itemId]
      );

      if (itemResult.rowCount === 0) {
        throw new NotFoundError("Item not found");
      }

      const item = itemResult.rows[0];
      const price = isTradable ? item.tradable_price : item.non_tradable_price;

      if (price === null) {
        throw new ValidationError(
          `${
            isTradable ? "Tradable" : "Non-tradable"
          } version of this item is not available`
        );
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
        throw new NotFoundError("User not found");
      }

      const user = userResult.rows[0];

      if (user.balance < price) {
        throw new ValidationError("Insufficient balance");
      }

      // Update user balance
      const updatedUserResult = await client.query(
        `UPDATE users 
         SET balance = balance - $1
         WHERE id = $2
         RETURNING balance`,
        [price, userId]
      );

      // Create purchase record
      const purchaseResult = await client.query(
        `INSERT INTO purchases (
          user_id, 
          item_id,
          price,
          is_tradable,
          created_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id, created_at`,
        [userId, itemId, price, isTradable]
      );

      const purchase = purchaseResult.rows[0];

      await client.query("COMMIT");

      return {
        purchase: {
          id: purchase.id,
          item_name: item.name,
          price: Number(price),
          created_at: purchase.created_at,
        },
        updatedBalance: Number(updatedUserResult.rows[0].balance),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
