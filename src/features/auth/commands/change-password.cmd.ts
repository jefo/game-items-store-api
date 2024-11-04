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
import {
  verifyPassword,
  hashPassword,
  validatePassword,
} from "../../../lib/auth/pwd.utils";
import { ChangePasswordCommandType } from "./types";
import { ValidationError } from "../../../lib/errors";

export interface ChangePasswordDto {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

@register(key(ChangePasswordCommandType))
@provider(singleton())
export class ChangePasswordCommand implements ICmd<ChangePasswordDto, void> {
  constructor(@inject(by.key("DbPool")) private db: Pool) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordDto): Promise<void> {
    const result = await this.db.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];

    if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
      throw new ValidationError("Invalid current password");
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await this.db.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newPasswordHash, userId]
    );
  }
}

export { ChangePasswordCommandType };
