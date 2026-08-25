import { useTheme } from "../theme/ThemeContext";

export default function NavBar() {
  const { themeName, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between w-full p-4 bg-background text-text">
      <button onClick={toggleTheme}>
        {themeName === "light" ? "🌙" : "☀️"}
      </button>
      <button
        className="bg-black/50 text-white hover:bg-primary/80 p-2 rounded"
        onClick={() => {
          (
            globalThis as typeof globalThis & {
              chrome: { runtime: { openOptionsPage: () => void } };
            }
          ).chrome.runtime.openOptionsPage();
        }}
      >
        Add Profile
      </button>
      <ul className="flex space-x-4 font-semibold font-mono text-red-400">
        <li>Logout</li>
      </ul>
    </div>
  );
}
