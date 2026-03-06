export const getActivityMetrics = async (repos, githubToken) => {
  const sinceDate = new Date();
  sinceDate.setMonth(sinceDate.getMonth() - 6);

  let commitCount6Months = 0;
  const activeWeeksSet = new Set();

  for (const repo of repos) {
    let page = 1;

    while (true) {
      const commitRes = await axios.get(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`,
        {
          headers: { Authorization: `Bearer ${githubToken}` },
          params: {
            since: sinceDate.toISOString(),
            per_page: 100,
            page
          }
        }
      );

      if (commitRes.data.length === 0) break;

      for (const commit of commitRes.data) {
        const date = new Date(commit.commit.author.date);
        commitCount6Months++;

        const yearWeek = `${date.getFullYear()}-${Math.ceil(
          (date - new Date(date.getFullYear(), 0, 1)) / 604800000
        )}`;

        activeWeeksSet.add(yearWeek);
      }

      page++;
    }
  }

  return {
    commitCount6Months,
    activeWeeks: activeWeeksSet.size
  };
};