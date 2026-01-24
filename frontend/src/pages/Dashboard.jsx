import { useEffect, useState } from "react";

export default function Dashboard() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/me", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setAuth(data.authenticated));
  }, []);

  if (auth === null) return <p>Checking auth...</p>;
  if (!auth) return <p>Unauthorized</p>;

  return <h2>Welcome to Dashboard</h2>;
}
