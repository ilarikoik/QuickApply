import { useState } from "react";
import { login, register } from "../lib/api";

export default function LoginForm({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [create, setCreate] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = create
        ? await register(username, password)
        : await login(username, password);
      await chrome.storage.local.set({ authToken: response.token });
      onAuthenticated(response.token);
    } catch (cause) {
      console.error("Authentication failed:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Kirjautuminen epäonnistui. Tarkista backend-yhteys.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-4"
    >
      <p className="text-yellow-500 font-mono font-semibold text-lg">
        {create ? "Luo käyttäjätili" : "Kirjaudu jatkaaksesi"}
      </p>
      <input
        type="text"
        autoComplete="username"
        required
        minLength={3}
        maxLength={80}
        placeholder="Username"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        autoComplete={create ? "new-password" : "current-password"}
        required
        minLength={8}
        maxLength={72}
        placeholder="Password"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && (
        <p role="alert" className="max-w-72 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-col items-center justify-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer disabled:opacity-50"
        >
          {submitting ? "Odota..." : create ? "Luo tili" : "Kirjaudu"}
        </button>
        <p className="text-sm text-slate-400">
          {create ? "Onko sinulla jo tili?" : "Eikö sinulla ole tiliä?"}
          <button
            type="button"
            onClick={() => {
              setError("");
              setCreate(!create);
            }}
            className="text-black hover:underline ml-1"
          >
            {create ? "Kirjaudu" : "Luo tili"}
          </button>
        </p>
      </div>
    </form>
  );
}
