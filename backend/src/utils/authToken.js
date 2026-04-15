export const extractAuthToken = (req) => {
  const cookieToken = req?.cookies?.auth;
  if (cookieToken) return cookieToken;

  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  if (!authHeader || typeof authHeader !== "string") return null;

  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;

  return token.trim() || null;
};

