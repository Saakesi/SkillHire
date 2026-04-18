import { useEffect, useState } from "react";
import { insightService } from "../../../services/insightService";

export const useInsights = (profile) => {
  const [developerInsights, setDeveloperInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  useEffect(() => {
    if (!profile) return;

    const identifier = profile.githubId || profile._id || profile.username;
    if (!identifier) return;

    let cancelled = false;
    setInsightsLoading(true);
    setInsightsError("");
    setDeveloperInsights(null);

    insightService
      .getUserInsights(identifier)
      .then((res) => {
        if (cancelled) return;
        setDeveloperInsights(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setDeveloperInsights(null);
        setInsightsError(err.response?.data?.error || "Failed to load developer insights.");
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  return {
    developerInsights,
    insightsLoading,
    insightsError
  };
};
