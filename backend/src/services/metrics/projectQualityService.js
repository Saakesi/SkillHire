import axios from "axios";
import pMap from "p-map";

export const getProjectQualityMetrics = async (repos, githubToken) => {

  const qualityIndicators = {
    readme: 0,
    ci: 0,
    tests: 0,
    docker: 0,
    license: 0,

    // deployment
    vercel: 0,
    render: 0,
    aws: 0,
    firebase: 0,
    netlify: 0,
    kubernetes: 0,
  };

  await pMap(
    repos,
    async (repo) => {
      try {

        const res = await axios.get(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents`,
          {
            headers: { Authorization: `Bearer ${githubToken}` }
          }
        );

        const files = res.data.map(f => f.name.toLowerCase());

        if (files.some(f => f.startsWith("readme"))) qualityIndicators.readme++;

        if (files.includes("dockerfile")) qualityIndicators.docker++;

        if (files.some(f => f.includes("license"))) qualityIndicators.license++;

        if (
          files.includes(".github") ||
          files.includes(".gitlab-ci.yml") ||
          files.includes("circle.yml")
        ) {
          qualityIndicators.ci++;
        }

        if (
          files.includes("test") ||
          files.includes("tests") ||
          files.includes("__tests__")
        ) {
          qualityIndicators.tests++;
        }

        // ===== Deployment Detection =====

        if (files.includes("vercel.json")) {
          qualityIndicators.vercel++;
        }

        if (files.includes("render.yaml") || files.includes("render.yml")) {
          qualityIndicators.render++;
        }

        if (files.includes("firebase.json")) {
          qualityIndicators.firebase++;
        }

        if (files.includes("netlify.toml")) {
          qualityIndicators.netlify++;
        }

        // AWS (serverless)
        if (
          files.includes("serverless.yml") ||
          files.includes("serverless.yaml") ||
          files.includes("template.yaml")
        ) {
          qualityIndicators.aws++;
        }

        // Kubernetes
        if (
          files.includes("k8s.yml") ||
          files.includes("k8s.yaml") ||
          files.includes("deployment.yml") ||
          files.includes("deployment.yaml") ||
          files.includes("kubernetes.yml") ||
          files.includes("kubernetes.yaml")
        ) {
          qualityIndicators.kubernetes++;
        }

      } catch {
        // ignore inaccessible repos
      }
    },
    { concurrency: 5 } // safe GitHub concurrency
  );

  return qualityIndicators;
};