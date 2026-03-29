export function computeLeetCodeScore(metrics) {
  if (!metrics) return 0;

  const { solved, contest, algorithms } = metrics;

  const medium = solved?.medium || 0;
  const hard   = solved?.hard   || 0;
  const total  = solved?.total  || 0;

  /* ─── 1. Total solved (MAX 25) ───────────────────────────────
     LC has 3000+ problems. Solving 800 out of 3000 is NOT max.
     Reference: top 1% solvers have 2000+.
  ─────────────────────────────────────────────────────────────── */
  let solvedScore = 0;
  if      (total >= 2000) solvedScore = 25;
  else if (total >= 1500) solvedScore = 22;
  else if (total >= 1000) solvedScore = 18;
  else if (total >= 700)  solvedScore = 15;
  else if (total >= 400)  solvedScore = 11;
  else if (total >= 200)  solvedScore = 8;
  else if (total >= 100)  solvedScore = 5;
  else                    solvedScore = 2;

  /* ─── 2. Hard problems (MAX 30) ─────────────────────────────
     Primary differentiator. LC has 800+ hard problems.
     Old formula maxed at 36 hard — way too easy.
  ─────────────────────────────────────────────────────────────── */
  let hardScore = 0;
  if      (hard >= 400) hardScore = 30;
  else if (hard >= 250) hardScore = 25;
  else if (hard >= 150) hardScore = 20;
  else if (hard >= 100) hardScore = 15;
  else if (hard >= 50)  hardScore = 10;
  else if (hard >= 20)  hardScore = 5;

  /* ─── 3. Medium problems (MAX 15) ───────────────────────────
     LC has 1600+ medium. Old formula maxed at 188 medium.
  ─────────────────────────────────────────────────────────────── */
  let mediumScore = 0;
  if      (medium >= 600) mediumScore = 15;
  else if (medium >= 400) mediumScore = 12;
  else if (medium >= 250) mediumScore = 9;
  else if (medium >= 150) mediumScore = 6;
  else if (medium >= 75)  mediumScore = 4;
  else if (medium > 0)    mediumScore = 2;

  /* ─── 4. Contest rating (MAX 20) ─────────────────────────────
     LeetCode rating tiers:
     2800+ = Grandmaster  |  2400+ = Knight  |  2100+ = Guard
     1900+ = Advanced     |  1700+ = Expert  |  1500+ = Competent
  ─────────────────────────────────────────────────────────────── */
  let contestScore = 0;
  const rating = contest?.rating || 0;
  if      (rating >= 2800) contestScore = 20;
  else if (rating >= 2400) contestScore = 17;
  else if (rating >= 2100) contestScore = 14;
  else if (rating >= 1900) contestScore = 11;
  else if (rating >= 1700) contestScore = 8;
  else if (rating >= 1500) contestScore = 5;
  else if (rating >= 1300) contestScore = 3;
  else if (rating > 0)     contestScore = 1;

  /* ─── 5. Contest participation (MAX 5) ──────────────────────── */
  let participationScore = 0;
  const contests = contest?.contestsAttended || 0;
  if      (contests >= 50) participationScore = 5;
  else if (contests >= 30) participationScore = 4;
  else if (contests >= 15) participationScore = 3;
  else if (contests >= 5)  participationScore = 2;
  else if (contests >= 1)  participationScore = 1;

  /* ─── 6. Algorithm diversity (MAX 5) ────────────────────────── */
  const tagCount =
    (algorithms?.advanced?.length    || 0) +
    (algorithms?.intermediate?.length || 0) +
    (algorithms?.fundamental?.length  || 0);
  const diversityScore = Math.min(tagCount * 0.2, 5);

  /* ─── FINAL (MAX 100) ─────────────────────────────────────── */
  const totalScore =
    solvedScore + hardScore + mediumScore +
    contestScore + participationScore + diversityScore;

  return Math.min(Math.round(totalScore * 100) / 100, 100);
}
