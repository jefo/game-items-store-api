export async function loginUser(username: string = 'testuser', password: string = 'password123') {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  const cookies = response.headers.get('set-cookie');
  
  return {
    sessionId: cookies?.match(/sessionId=([^;]+)/)?.[1],
    data,
  };
}

export async function makeAuthenticatedRequest(
  path: string,
  options: RequestInit = {},
  sessionId?: string
) {
  if (!sessionId) {
    const { sessionId: newSessionId } = await loginUser();
    sessionId = newSessionId;
  }

  const response = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      ...options.headers,
      'Cookie': `sessionId=${sessionId}`,
      'Content-Type': 'application/json',
    },
  });

  return {
    response,
    data: await response.json(),
  };
}
