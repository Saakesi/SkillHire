import axios from "axios";

export const getActivityMetrics = async (repos, githubToken) => {

  console.log("📊 Starting activity analysis...");

  const sinceDate = new Date();
  sinceDate.setMonth(sinceDate.getMonth() - 6);

  let commitCount6Months = 0;

  const activeWeeksSet = new Set();
  const activeDaysSet = new Set();

  for (const repo of repos) {

    console.log(`🔍 Checking commits in ${repo.name}`);

    let page = 1;

    while (true) {

      try {

        const res = await axios.get(
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

        if (res.data.length === 0) break;

        for (const commit of res.data) {

          // skip commits without author
          if (!commit.commit?.author?.date) continue;

          const date = new Date(commit.commit.author.date);

          commitCount6Months++;

          const yearWeek = `${date.getFullYear()}-${Math.ceil(
            (date - new Date(date.getFullYear(), 0, 1)) / 604800000
          )}`;

          activeWeeksSet.add(yearWeek);

          const day = date.toISOString().split("T")[0];
          activeDaysSet.add(day);
        }

        page++;

      } catch (err) {

        console.log(`⚠️ Skipping repo ${repo.name}: ${err.response?.status || err.message}`);
        break;
      }
    }
  }

  // ===== streak calculation =====

  const sortedDays = Array.from(activeDaysSet).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let prevDate = null;

  for (const day of sortedDays) {

    const currentDate = new Date(day);

    if (!prevDate) {
      currentStreak = 1;
    } else {

      const diff =
        (currentDate - prevDate) / (1000 * 60 * 60 * 24);

      if (diff === 1) currentStreak++;
      else currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    prevDate = currentDate;
  }

  console.log("✅ Activity analysis complete");

  return {
    commitCount6Months,
    activeWeeks: activeWeeksSet.size,
    longestStreak
  };
};