export function normalizeSonar(sonar) {
  if (!sonar) return null;

  const get = key =>
    Number(sonar.find(m => m.metric === key)?.value ?? 0);

  return {
    bugs: get("bugs"),
    vulnerabilities: get("vulnerabilities"),
    codeSmells: get("code_smells"),
    coverage: get("coverage"),
    duplication: get("duplicated_lines_density"),
    reliability: 6 - get("reliability_rating"),
    security: 6 - get("security_rating"),
    maintainability: 6 - get("sqale_rating")
  };
}
