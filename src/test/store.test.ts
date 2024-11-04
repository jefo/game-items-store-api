import "reflect-metadata";
import { describe, expect, it, beforeAll, afterAll } from "bun:test";

describe("Game Items Store", () => {
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

  describe("GET /api/store", () => {
    it("should return list of available items", async () => {
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
      const sessionId = loginData.data.sessionId;

      const response = await fetch('http://localhost:3000/api/store', {
        headers: {
          'Cookie': `sessionId=${sessionId}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.status).toBe("success");
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should fail without authentication", async () => {
      const response = await fetch('http://localhost:3000/api/store');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe("error");
      expect(data.error).toBeDefined();
    });
  });

  describe("POST /api/store/purchases", () => {
    it("should successfully purchase item with sufficient balance", async () => {
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
      const sessionId = loginData.data.sessionId;

      const response = await fetch('http://localhost:3000/api/store/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sessionId=${sessionId}`,
        },
        body: JSON.stringify({
          itemId: 1,
          isTradable: true,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.status).toBe("success");
    });

    it("should fail purchase with insufficient balance", async () => {
      // First login to get session
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'pooruser', 
          password: 'password123' 
        }),
      });

      const loginData = await loginResponse.json();
      const sessionId = loginData.data.sessionId;

      const response = await fetch('http://localhost:3000/api/store/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sessionId=${sessionId}`,
        },
        body: JSON.stringify({
          itemId: 1,
          isTradable: true,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.status).toBe("error");
      expect(data.error).toBeDefined();
    });

    it("should fail purchase with non-existent item", async () => {
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
      const sessionId = loginData.data.sessionId;

      const response = await fetch('http://localhost:3000/api/store/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `sessionId=${sessionId}`,
        },
        body: JSON.stringify({
          itemId: 999,
          isTradable: true,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.status).toBe("error");
      expect(data.error).toBeDefined();
    });
  });
});
