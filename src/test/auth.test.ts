import "reflect-metadata";
import { describe, expect, it, beforeAll, afterAll } from "bun:test";

describe("Authentication", () => {
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const { setupTestEnvironment } = await import('./setup-test-env');
    const env = await setupTestEnvironment();
    cleanup = env.cleanup;
  });

  afterAll(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  describe("POST /api/auth/login", () => {
    it("should successfully login with valid credentials", async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'testuser', 
          password: 'password123' 
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.status).toBe("success");
      expect(data.data).toHaveProperty("username", "testuser");
      expect(data.data).toHaveProperty("balance");
      expect(data.data).toHaveProperty("sessionId");
    });

    it("should fail with invalid credentials", async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'testuser', 
          password: 'wrongpassword' 
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.status).toBe("error");
      expect(data.error).toBeDefined();
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should successfully change password with valid current password", async () => {
      // First login to get session
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'testuser', 
          password: 'password123' 
        }),
      });

      const loginData = await loginResponse.json();
      expect(loginData.status).toBe("success");
      expect(loginData.data).toHaveProperty("sessionId");
      const sessionId = loginData.data.sessionId;

      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sessionId=${sessionId}`,
        },
        body: JSON.stringify({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.status).toBe("success");

      // Verify can login with new password
      const newLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'testuser', 
          password: 'newpassword123' 
        }),
      });

      const newLoginData = await newLoginResponse.json();
      expect(newLoginResponse.status).toBe(200);
      expect(newLoginData.status).toBe("success");
    });

    it("should fail with invalid current password", async () => {
      // First login to get session
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'testuser', 
          password: 'newpassword123' // Use the new password
        }),
      });

      const loginData = await loginResponse.json();
      expect(loginData.status).toBe("success");
      expect(loginData.data).toHaveProperty("sessionId");
      const sessionId = loginData.data.sessionId;

      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sessionId=${sessionId}`,
        },
        body: JSON.stringify({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.status).toBe("error");
      expect(data.error).toBeDefined();
    });

    it("should fail with invalid new password format", async () => {
      // First login to get session
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'testuser', 
          password: 'newpassword123' // Use the new password
        }),
      });

      const loginData = await loginResponse.json();
      expect(loginData.status).toBe("success");
      expect(loginData.data).toHaveProperty("sessionId");
      const sessionId = loginData.data.sessionId;

      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sessionId=${sessionId}`,
        },
        body: JSON.stringify({
          currentPassword: 'newpassword123',
          newPassword: 'short',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.status).toBe("error");
      expect(data.error).toBeDefined();
    });
  });
});
