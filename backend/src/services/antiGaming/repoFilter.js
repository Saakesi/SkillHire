export const filterValidRepos = repos => {
  return repos.filter(repo => {
    if (!repo) return false;
    if (repo.fork === true) return false;

    if (typeof repo.size === "number" && repo.size < 5) return false;

    const hasLanguage = typeof repo.language === "string";
    const hasTopics = Array.isArray(repo.topics) && repo.topics.length > 0;

    if (!hasLanguage && !hasTopics) return false;

    return true;
  });
};
