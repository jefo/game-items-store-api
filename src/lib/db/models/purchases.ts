import { Type } from '@sinclair/typebox'

export const PurchaseSchema = Type.Object({
  id: Type.Integer(),
  user_id: Type.Integer(),
  item_id: Type.Integer(),
  quantity: Type.Integer({ minimum: 1, default: 1 }),
  total_price: Type.Number(),
  purchase_date: Type.String({ format: 'date-time' })
})

export type Purchase = typeof PurchaseSchema.static
