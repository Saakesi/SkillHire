import Analysis from "../models/Analysis.js";

export const updateWeeklyScores = async () => {
  const users = await Analysis.find({});

  for (const user of users) {
    const previous = user.scoreLastWeek || 0;
    const current = user.finalScore || 0;

    user.scoreChange = current - previous;
    user.scoreLastWeek = current;

    await user.save();
  }

  console.log("✅ Weekly scores updated");
};