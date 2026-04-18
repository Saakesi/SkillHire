import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/dashboardUtils";

export const useAnalysis = (username) => {
  const [analysis, setAnalysis] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [badges, setBadges] = useState([]);
  const [status, setStatus] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!username) return;

    setAnalysisLoading(true);
    axios
      .get(`${API_BASE_URL}/api/analyze/status/${username}`)
      .then((res) => {
        setAnalysis(res.data);
        if (res.data?.rawMetrics) {
          setMetrics(res.data.rawMetrics);
          setBadges(res.data.badges || []);
          setUpdatedAt(res.data.updatedAt);
          setStatus(res.data.status);
        }
        if (res.data.status === "processing" || res.data.status === "queued") {
          setPolling(true);
        }
      })
      .catch(console.error)
      .finally(() => setAnalysisLoading(false));
  }, [username]);

  useEffect(() => {
    if (!polling || !username) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/analyze/status/${username}`, {
          withCredentials: true
        });

        setStatus(res.data.status);
        if (res.data.status === "completed") {
          setAnalysis(res.data);
          setMetrics(res.data.rawMetrics);
          setBadges(res.data.badges || []);
          setUpdatedAt(res.data.updatedAt);
          setPolling(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [polling, username]);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/analyze`, {}, { withCredentials: true });
      setStatus("queued");
      setPolling(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const overallScore = analysis?.overallScore || 0;
  const isAnalyzing = polling || status === "processing" || status === "queued";
  const lc = analysis?.leetcodeMetrics;
  const lcScore = analysis?.leetcodeScore || 0;

  return {
    analysis,
    metrics,
    badges,
    status,
    analysisLoading,
    updatedAt,
    loading,
    polling,
    overallScore,
    isAnalyzing,
    lc,
    lcScore,
    handleAnalyze
  };
};
