import { Type } from "@sinclair/typebox";

export const GameItemSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String({ maxLength: 255 }),
  description: Type.Union([Type.String(), Type.Null()]),
  price: Type.Number(),
  stock: Type.Integer(),
  created_at: Type.String({ format: "date-time" }),
  updated_at: Type.String({ format: "date-time" }),
});

export type GameItem = typeof GameItemSchema.static;
