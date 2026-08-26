import { useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [create, setCreate] = useState(false);

  if (!create) {
    // await loginUser(username, password);
  } else {
    // await createUser(username, password);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 ">
      <p className="text-yellow-500 font-mono font-semibold text-lg">
        Please log in to continue.
      </p>
      <input
        type="text"
        placeholder="Username"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer">
          {create ? "Create Account" : "Log In"}
        </button>
        <p className="text-sm text-slate-400">
          Don't have an account?
          <a
            onClick={() => setCreate(!create)}
            className="text-black hover:underline ml-1"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
