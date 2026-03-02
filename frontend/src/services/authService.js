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
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: 'include', // req for cookies
        });

        if (!res.ok) return null;
        return res.json();
    },

    async logout() {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    },
};
