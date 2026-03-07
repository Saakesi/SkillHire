import axios from "axios";
import pMap from "p-map";

export const getActivityMetrics = async (repos, githubToken, username) => {

  const sinceDate = new Date();
  sinceDate.setMonth(sinceDate.getMonth() - 6);

  let commitCount6Months = 0;

  const activeWeeksSet = new Set();
  const activeDaysSet = new Set();
  const monthlyCommits = new Map();

  await pMap(
    repos,
    async (repo) => {

      let page = 1;

      while (true) {

        try {

          const res = await axios.get(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`,
            {
              headers: { Authorization: `Bearer ${githubToken}` },
              params: {
                author: username,
                since: sinceDate.toISOString(),
                per_page: 100,
                page
              }
            }
          );

          if (!res.data.length) break;

          for (const commit of res.data) {

            if (!commit.commit?.author?.date) continue;

            const date = new Date(commit.commit.author.date);

            commitCount6Months++;

            const yearWeek = `${date.getFullYear()}-${Math.ceil(
              (date - new Date(date.getFullYear(), 0, 1)) / 604800000
            )}`;

            activeWeeksSet.add(yearWeek);

            const day = date.toISOString().split("T")[0];
            activeDaysSet.add(day);

            const monthKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;

            const current = monthlyCommits.get(monthKey) || 0;
            monthlyCommits.set(monthKey, current + 1);
          }

          page++;

        } catch {
          break;
        }
      }
    },
    { concurrency: 3 } // important: commit API is heavy
  );

  // ===== streak calculation =====

  const sortedDays = Array.from(activeDaysSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let prevDate = null;

  for (const day of sortedDays) {

    const currentDate = new Date(day);

    if (!prevDate) currentStreak = 1;
    else {
      const diff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
      currentStreak = diff === 1 ? currentStreak + 1 : 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    prevDate = currentDate;
  }

  return {
    commitCount6Months,
    activeWeeks: activeWeeksSet.size,
    longestStreak,
    monthlyCommits: Object.fromEntries(monthlyCommits)
  };
};