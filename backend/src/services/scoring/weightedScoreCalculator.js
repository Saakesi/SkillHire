export const calculateWeightedScore = (skill, repos) => {
  const stars = repos.reduce((s, r) => s + r.stars, 0);
  return skill.confidence * Math.log(stars + 1);
};
