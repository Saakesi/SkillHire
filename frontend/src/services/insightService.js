import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const insightService = {
  getUserInsights(identifier) {
    return axios.get(
      `${API_BASE_URL}/api/user/${encodeURIComponent(identifier)}/insights`,
      { withCredentials: true }
    ).then((res) => res.data);
  },
};
