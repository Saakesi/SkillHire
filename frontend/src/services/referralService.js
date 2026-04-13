import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const request = (config) =>
  axios({
    ...config,
    withCredentials: true,
  }).then((res) => res.data);

export const referralService = {
  getOpenUsers(params = {}) {
    return request({
      method: "GET",
      url: `${API_BASE_URL}/api/referrals/open`,
      params,
    });
  },

  requestReferral(username, payload) {
    return request({
      method: "POST",
      url: `${API_BASE_URL}/api/referrals/request/${username}`,
      data: payload,
    });
  },

  getIncoming() {
    return request({
      method: "GET",
      url: `${API_BASE_URL}/api/referrals/incoming`,
    });
  },

  getSent() {
    return request({
      method: "GET",
      url: `${API_BASE_URL}/api/referrals/sent`,
    });
  },

  acceptReferral(referralId) {
    return request({
      method: "POST",
      url: `${API_BASE_URL}/api/referrals/accept/${referralId}`,
    });
  },

  rejectReferral(referralId) {
    return request({
      method: "POST",
      url: `${API_BASE_URL}/api/referrals/reject/${referralId}`,
    });
  },
};
