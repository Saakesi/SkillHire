import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const request = (config) =>
  axios({
    ...config,
    withCredentials: true,
  }).then((res) => res.data);

export const messageService = {
  getConversations() {
    return request({
      method: "GET",
      url: `${API_BASE_URL}/api/messages`,
    });
  },

  getConversation(username) {
    return request({
      method: "GET",
      url: `${API_BASE_URL}/api/messages/${username}`,
    });
  },

  sendMessage(username, text) {
    return request({
      method: "POST",
      url: `${API_BASE_URL}/api/messages/${username}`,
      data: { text },
    });
  },
};
