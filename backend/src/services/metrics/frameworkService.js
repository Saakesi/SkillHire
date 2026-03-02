import axios from "axios";

export const detectFrameworks = async (repos, githubToken) => {
    const detectedFrameworks = new Set();

    for (const repo of repos) {
        try {
            // JS Ecosystem
            const pkgRes = await axios.get(
                `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/package.json`,
                {
                    headers: { Authorization: `Bearer ${githubToken}` }
                }
            );

            const pkgContent = JSON.parse(
                Buffer.from(pkgRes.data.content, "base64").toString()
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

        } catch (err) {
            // package.json not found - ignore
        }

        try {
            // Python Ecosystem
            const reqRes = await axios.get(
                `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents/requirements.txt`,
                {
                    headers: { Authorization: `Bearer ${githubToken}` }
                }
            );

            const reqContent = Buffer.from(reqRes.data.content, "base64").toString().toLowerCase();

            if (reqContent.includes("django")) detectedFrameworks.add("Django");
            if (reqContent.includes("flask")) detectedFrameworks.add("Flask");
            if (reqContent.includes("fastapi")) detectedFrameworks.add("FastAPI");

        } catch (err) {
            // requirements.txt not found - we will ignore this
        }
    }

    return Array.from(detectedFrameworks);
};