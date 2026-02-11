export function sonarTrustModifier(normalized) {
  if (!normalized) return 1;

  let trust = 1;

  if (normalized.bugs > 10) trust -= 0.1;
  if (normalized.vulnerabilities > 0) trust -= 0.2;
  if (normalized.coverage < 30) trust -= 0.1;
  if (normalized.duplication > 20) trust -= 0.1;

  return Math.max(0.6, trust);
}
