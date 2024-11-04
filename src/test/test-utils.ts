import { setupTestEnvironment } from "./setup-test-env";

let testEnv: Awaited<ReturnType<typeof setupTestEnvironment>> | null = null;

export async function getTestEnv() {
  if (!testEnv) {
    testEnv = await setupTestEnvironment();
  }
  return testEnv;
}

export async function cleanupTestEnv() {
  if (testEnv) {
    await testEnv.cleanup();
    testEnv = null;
  }
}
