import { useEffect, useState } from "react";
import AddProfile from "../components/AddProfile";
import { ThemeProvider } from "../theme/ThemeContext";

export default function OptionsApp() {
  const [token, setToken] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    chrome.storage.local
      .get("authToken")
      .then((result) => {
        if (typeof result.authToken === "string") setToken(result.authToken);
      })
      .catch((cause: unknown) => {
        console.error("Could not load saved login:", cause);
        setError("Kirjautumistietoja ei voitu ladata.");
      });
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-text p-8">
        {token ? (
          <AddProfile
            token={token}
            onBack={() => window.close()}
            onSaved={() => window.close()}
          />
        ) : (
          <p role={error ? "alert" : "status"}>
            {error || "Kirjaudu ensin laajennuksen popupissa."}
          </p>
        )}
      </div>
    </ThemeProvider>
  );
}
