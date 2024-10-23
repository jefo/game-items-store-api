import { Type } from '@sinclair/typebox'

export const UserSchema = Type.Object({
  id: Type.Integer(),
  username: Type.String({ maxLength: 255 }),
  email: Type.String({ maxLength: 255, format: 'email' }),
  created_at: Type.String({ format: 'date-time' }),
  updated_at: Type.String({ format: 'date-time' })
})

export type User = typeof UserSchema.static
