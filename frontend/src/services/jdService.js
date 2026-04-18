import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const jdService = {
  matchCandidates({ jdText = "", jdFile = null, limit = 100 } = {}) {
    if (jdFile) {
      const formData = new FormData();
      formData.append("limit", String(limit));
      if (jdText) formData.append("jdText", jdText);
      formData.append("jdFile", jdFile);

      return axios.post(
        `${API_BASE_URL}/api/jd/match`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      ).then((res) => res.data);
    }

    return axios.post(
      `${API_BASE_URL}/api/jd/match`,
      { jdText, limit },
      { withCredentials: true }
    ).then((res) => res.data);
  },
};
