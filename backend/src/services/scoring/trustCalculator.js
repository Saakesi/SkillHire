export const calculateTrust = (skill, repos) => {
  const lowEffort = repos.filter(r => r.lines < 50).length;
  const ratio = lowEffort / repos.length;

  return Math.max(0.5, 1 - ratio * 0.3);
};
