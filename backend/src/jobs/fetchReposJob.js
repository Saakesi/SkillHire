import { createQueue } from "../redisClient.js";

export const fetchReposQueue = createQueue("fetch-repos");

export const addFetchReposJob = async (githubId, accessToken) => {
  await fetchReposQueue.add("fetchRepos", { githubId, accessToken });
};
