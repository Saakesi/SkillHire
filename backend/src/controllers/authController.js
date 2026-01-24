import axios from "axios";
import jwt from "jsonwebtoken";

export const githubLogin = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`;
  res.redirect(url);
};

export const githubCallback = async (req, res) => {
  const { code } = req.query;

  try {
    // exchange code → token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;

    // fetch github user
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const githubUser = userRes.data;

    // create jwt
    const jwtToken = jwt.sign(
      {
        githubId: githubUser.id,
        username: githubUser.login
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // set cookie
    res.cookie("auth", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production (https)
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect("http://localhost:5173/dashboard");

  } catch (err) {
    res.status(500).json({ error: "OAuth failed" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("auth");
  res.json({ message: "Logged out" });
};
