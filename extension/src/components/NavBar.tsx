import { useTheme } from "../theme/ThemeContext";

export default function NavBar() {
  const { themeName, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between w-full p-4 bg-background text-text">
      <ul className="flex space-x-4">
        <li>Profile</li>
        <li>Logout</li>
      </ul>
      <button onClick={toggleTheme}>
        {themeName === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}
