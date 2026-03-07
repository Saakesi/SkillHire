import axios from "axios";
import pMap from "p-map";

export const detectFrameworks = async (repos, githubToken) => {
  const detectedFrameworks = new Set();

  await pMap(
    repos,
    async (repo) => {
      const owner = repo.owner.login;
      const repoName = repo.name;

      const pkgUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/package.json`;
      const reqUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/requirements.txt`;

      // Fetch both files in parallel
      const [pkgRes, reqRes] = await Promise.allSettled([
        axios.get(pkgUrl, {
          headers: { Authorization: `Bearer ${githubToken}` }
        }),
        axios.get(reqUrl, {
          headers: { Authorization: `Bearer ${githubToken}` }
        })
      ]);

      // ----- JS Ecosystem -----
      if (pkgRes.status === "fulfilled") {
        try {
          const pkgContent = JSON.parse(
            Buffer.from(pkgRes.value.data.content, "base64").toString()
          );

          const dependencies = {
            ...pkgContent.dependencies,
            ...pkgContent.devDependencies
          };

          if (dependencies) {
            if (dependencies.react) detectedFrameworks.add("React");
            if (dependencies.next) detectedFrameworks.add("Next.js");
            if (dependencies.express) detectedFrameworks.add("Express");
            if (dependencies["@nestjs/core"]) detectedFrameworks.add("NestJS");
            if (dependencies.vue) detectedFrameworks.add("Vue");
            if (dependencies.angular) detectedFrameworks.add("Angular");
          }
        } catch {}
      }

      // ----- Python Ecosystem -----
      if (reqRes.status === "fulfilled") {
        const reqContent = Buffer.from(
          reqRes.value.data.content,
          "base64"
        )
          .toString()
          .toLowerCase();

        if (reqContent.includes("django")) detectedFrameworks.add("Django");
        if (reqContent.includes("flask")) detectedFrameworks.add("Flask");
        if (reqContent.includes("fastapi")) detectedFrameworks.add("FastAPI");
      }
    },
    { concurrency: 5 } // safe concurrency for GitHub API
  );

  return Array.from(detectedFrameworks);
};