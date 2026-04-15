import { authToken } from "./authToken";
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const authService = {
    // Redirect user to GitHub OAuth via backend

    loginWithGitHub() {
        //OAuth = redirect, not fetch
        window.location.href = `${API_BASE_URL}/api/auth/github`;
    },


    //  Get currently authenticated user
    //  Backend should read cookie / token

    async getCurrentUser() {
        const authorization = authToken.asAuthorizationHeader();
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: 'include', // req for cookies
            headers: authorization ? { Authorization: authorization } : undefined,
        });

        if (!res.ok) return null;
        return res.json();
    },

    async logout() {
        const authorization = authToken.asAuthorizationHeader();
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: authorization ? { Authorization: authorization } : undefined,
        });
        authToken.clear();
    },
};
