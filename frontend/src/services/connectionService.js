import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const request = (config) =>
  axios({
    ...config,
    withCredentials: true,
  }).then((res) => res.data);

export const connectionService = {
  requestConnection(username, note = "") {
    return request({
      method: "POST",
      url: `${API_BASE_URL}/api/connections/request/${username}`,
      data: { note },
    });
  },

  getPending() {
    return request({
      method: "GET",
      url: `${API_BASE_URL}/api/connections/pending`,
    });
  },

  getAccepted() {
    return request({
      method: "GET",
      url: `${API_BASE_URL}/api/connections/list`,
    });
  },

  acceptConnection(connectionId) {
    return request({
      method: "POST",
      url: `${API_BASE_URL}/api/connections/accept/${connectionId}`,
    });
  },

  declineConnection(connectionId) {
    return request({
      method: "POST",
      url: `${API_BASE_URL}/api/connections/decline/${connectionId}`,
    });
  },
};
