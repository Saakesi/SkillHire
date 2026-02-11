import { Worker } from "bullmq";
import axios from "axios";
import Profile from "../models/Profile.js";
import { connection } from "../redisClient.js";

export const fetchSonarWorker = new Worker(
  "fetch-sonar",
  async job => {
    const { githubId, repoName, org } = job.data;

    const metrics = [
      "bugs",
      "vulnerabilities",
      "code_smells",
      "coverage",
      "duplicated_lines_density",
      "reliability_rating",
      "security_rating",
      "sqale_rating"
    ].join(",");

    const res = await axios.get(
      `https://sonarcloud.io/api/measures/component`,
      {
        params: {
          component: `${org}_${repoName}`,
          metricKeys: metrics
        },
        auth: {
          username: process.env.SONAR_TOKEN,
          password: ""
        }
      }
    );

    await Profile.updateOne(
      { githubId, "repos.name": repoName },
      {
        $set: {
          "repos.$.sonar": res.data.component.measures
        }
      }
    );

    console.log(`✅ Sonar metrics stored for ${repoName}`);
  },
  { connection }
);
