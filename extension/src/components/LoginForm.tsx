export default function LoginForm() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-yellow-500 font-mono font-semibold text-lg">
        Please log in to continue.
      </p>
      <input
        type="text"
        placeholder="Username"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        placeholder="Password"
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Log In
      </button>
    </div>
  );
}
