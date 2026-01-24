export default function Login() {
  const login = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div>
      <h1>GitHire</h1>
      <button onClick={login}>Login with GitHub</button>
    </div>
  );
}
