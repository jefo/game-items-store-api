import { key, provider, register, singleton } from "ts-ioc-container";
import { ICmd } from "../../../lib/cqrs";
import { db } from "../../../lib/db";
import { PasswordManager } from "../../../lib/auth/password";
import { ChangePasswordCommandType } from "./types";

export interface ChangePasswordDto {
    userId: number;
    currentPassword: string;
    newPassword: string;
}

@register(key(ChangePasswordCommandType))
@provider(singleton())
export class ChangePasswordCommand implements ICmd<ChangePasswordDto, void> {
    async execute({ userId, currentPassword, newPassword }: ChangePasswordDto): Promise<void> {
        // Validate new password
        const validationError = PasswordManager.validatePassword(newPassword);
        if (validationError) {
            throw new Error(validationError);
        }

        // Verify current password
        const result = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );
        const user = result.rows[0];

        if (!user || !(await PasswordManager.verify(currentPassword, user.password_hash))) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        const newPasswordHash = await PasswordManager.hash(newPassword);
        await db.query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newPasswordHash, userId]
        );
    }
}

export { ChangePasswordCommandType };
