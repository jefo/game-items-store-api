import { argon2id } from 'hash-wasm';

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return await argon2id({
        password,
        salt,
        parallelism: 1,
        iterations: 2,
        memorySize: 65536, // KB
        hashLength: 32,
        outputType: 'encoded'
    });
}

export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
    try {
        // Extract parameters from encoded hash
        const parts = encodedHash.split('$');
        if (parts.length !== 6) return false;

        // parts[4] is the base64 encoded salt
        const salt = Buffer.from(parts[4], 'base64');

        // Generate hash with same parameters
        const result = await argon2id({
            password,
            salt,
            parallelism: 1,
            iterations: 2,
            memorySize: 65536,
            hashLength: 32,
            outputType: 'encoded'
        });

        return result === encodedHash;
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}

export function validatePassword(password: string): string | null {
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
