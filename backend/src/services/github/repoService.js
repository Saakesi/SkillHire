import axios from "axios";

export const fetchUserRepos = async (githubToken) => {
    const response = await axios.get(
        "https://api.github.com/user/repos",
        {
            headers: { Authorization: `Bearer ${githubToken}` },
            params: {
                per_page: 100,
                visibility: "all"
            }
        }
    );

    // Ignore forked repos
    return response.data.filter(repo => !repo.fork);
};