export function computeLeetCodeScore(metrics) {
  if (!metrics) return 0;

  const { solved, contest, algorithms } = metrics;

  const easy = solved?.easy || 0;
  const medium = solved?.medium || 0;
  const hard = solved?.hard || 0;
  const total = solved?.total || 0;

  /* ---------------------------
     1. Total solved (MAX 35)
     Much stricter scaling
  --------------------------- */

  let solvedScore = 0;

  if (total >= 800) solvedScore = 35;
  else if (total >= 600) solvedScore = 30;
  else if (total >= 400) solvedScore = 25;
  else if (total >= 250) solvedScore = 20;
  else if (total >= 150) solvedScore = 15;
  else if (total >= 80) solvedScore = 10;
  else solvedScore = 5;

  /* ---------------------------
     2. Hard problem weight (MAX 25)
  --------------------------- */

  const hardScore = Math.min(hard * 0.7, 25);

  /* ---------------------------
     3. Medium problems (MAX 15)
  --------------------------- */

  const mediumScore = Math.min(medium * 0.08, 15);

  /* ---------------------------
     4. Algorithm diversity (MAX 10)
  --------------------------- */

  const tagCount =
    (algorithms?.advanced?.length || 0) +
    (algorithms?.intermediate?.length || 0) +
    (algorithms?.fundamental?.length || 0);

  const diversityScore = Math.min(tagCount * 0.4, 10);

  /* ---------------------------
     5. Contest rating (MAX 10)
  --------------------------- */

  let contestScore = 0;

  const rating = contest?.rating || 0;

  if (rating >= 2400) contestScore = 10;
  else if (rating >= 2100) contestScore = 9;
  else if (rating >= 1900) contestScore = 8;
  else if (rating >= 1700) contestScore = 6;
  else if (rating >= 1500) contestScore = 4;
  else if (rating >= 1300) contestScore = 2;

  /* ---------------------------
     6. Contest participation (MAX 5)
  --------------------------- */

  const contests = contest?.contestsAttended || 0;

  const participationScore = Math.min(contests / 20, 1) * 5;

  /* ---------------------------
     FINAL SCORE
  --------------------------- */

  const totalScore =
    solvedScore +
    hardScore +
    mediumScore +
    diversityScore +
    contestScore +
    participationScore;

  return Math.min(Math.round(totalScore * 100) / 100, 100);
}