const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const parseOrigins = () => {
  const values = [];

  if (process.env.FRONTEND_URLS) {
    values.push(
      ...process.env.FRONTEND_URLS
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    );
  }

  if (process.env.FRONTEND_URL) {
    values.push(process.env.FRONTEND_URL.trim());
  }

  return [...new Set(values)];
};

const resolvedOrigins = parseOrigins();
const hasHttpsOrigin = resolvedOrigins.some((origin) => origin.startsWith("https://"));

const cookieSecureOverride = process.env.COOKIE_SECURE?.toLowerCase();
const shouldUseSecureCookies =
  cookieSecureOverride === "true" ||
  (cookieSecureOverride !== "false" && hasHttpsOrigin);

const sameSite = shouldUseSecureCookies ? "none" : "lax";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite,
  secure: shouldUseSecureCookies,
  path: "/",
  maxAge: COOKIE_MAX_AGE_MS,
};

export const AUTH_COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  sameSite,
  secure: shouldUseSecureCookies,
  path: "/",
};

