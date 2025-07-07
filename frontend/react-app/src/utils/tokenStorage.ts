// správa access i refresh tokenu v localStorage

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

export function setAccessToken(token: string): void {
  localStorage.setItem('accessToken', token)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken')
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('refreshToken', token)
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}
