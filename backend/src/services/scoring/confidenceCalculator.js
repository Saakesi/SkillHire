export const calculateConfidence = skill => {
  const { commits, repos } = skill;
  return Math.min(100, Math.sqrt(commits * 10 + repos * 5));
};
