import { badgeRules } from "./badgeRules.js";

export function computeBadges(rawMetrics) {
  const badges = [];

  for (const badge of badgeRules) {
    try {
      if (badge.condition(rawMetrics)) {
        badges.push(badge.id);
        console.log("Badge earned:", badge.id);
        // console.log(badge.id);
      }
    } catch (err) {
      console.error(`Badge rule failed: ${badge.id}`);
    }
  }

  return badges;
}