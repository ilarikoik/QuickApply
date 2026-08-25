import AddProfile from "../components/AddProfile";
import { ThemeProvider } from "../theme/ThemeContext";
export default function OptionsApp() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-text p-8">
        <AddProfile />
      </div>
    </ThemeProvider>
  );
}
