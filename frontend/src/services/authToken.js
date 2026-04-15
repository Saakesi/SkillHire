const AUTH_TOKEN_KEY = "skillhire_auth_token";

export const authToken = {
  get() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  set(token) {
    if (!token) return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
  asAuthorizationHeader() {
    const token = this.get();
    return token ? `Bearer ${token}` : null;
  },
};

