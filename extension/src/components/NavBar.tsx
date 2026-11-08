import { useTheme } from "../theme/ThemeContext";

export default function NavBar({ onLogout }: { onLogout: () => void }) {
  const { themeName, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between w-full p-4 bg-background text-text">
      <button onClick={toggleTheme}>
        {themeName === "light" ? "🌙" : "☀️"}
      </button>
      <button
        className="bg-primary text-white hover:bg-primary/80 p-2 rounded"
        onClick={() => {
          (
            globalThis as typeof globalThis & {
              chrome: { runtime: { openOptionsPage: () => void } };
            }
          ).chrome.runtime.openOptionsPage();
        }}
      >
        Lisää profiili
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="font-semibold font-mono text-red-400 hover:underline"
      >
        Kirjaudu ulos
      </button>
    </div>
  );
}
