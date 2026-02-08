
import { Queue } from "bullmq";
import { connection } from "../redisClient.js";

export const fetchReposQueue = new Queue("fetch-repos", { connection });

export const addFetchReposJob = async (githubId, accessToken) => {
  await fetchReposQueue.add("fetchRepos", { githubId, accessToken });
};
