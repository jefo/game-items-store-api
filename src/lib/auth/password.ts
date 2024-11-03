import { argon2id } from 'hash-wasm';

export class PasswordManager {
    static async hash(password: string): Promise<string> {
        return await argon2id({
            password,
            salt: crypto.getRandomValues(new Uint8Array(16)),
            parallelism: 1,
            iterations: 256,
            memorySize: 512, // KB
            hashLength: 32,
            outputType: 'encoded'
        });
    }

    static async verify(password: string, encodedHash: string): Promise<boolean> {
        try {
            // Extract salt from encoded hash
            const parts = encodedHash.split('$');
            const salt = Buffer.from(parts[4], 'base64');

            const result = await argon2id({
                password,
                salt,
                parallelism: 1,
                iterations: 256,
                memorySize: 512,
                hashLength: 32,
                outputType: 'encoded'
            });
            return result === encodedHash;
        } catch {
            return false;
        }
    }

    static validatePassword(password: string): string | null {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        
        if (!/[A-Za-z]/.test(password)) {
            return 'Password must contain at least one letter';
        }
        
        if (!/\d/.test(password)) {
            return 'Password must contain at least one number';
        }
        
        return null;
    }
}
