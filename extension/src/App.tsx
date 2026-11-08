import { useCallback, useEffect, useState } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ThemeProvider } from "./theme/ThemeContext";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    chrome.storage.local
      .get("authToken")
      .then((result) => {
        setToken(typeof result.authToken === "string" ? result.authToken : null);
      })
      .catch((error: unknown) => {
        console.error("Could not load saved login:", error);
        setStorageError("Tallennettua kirjautumista ei voitu ladata.");
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await chrome.storage.local.remove(["authToken", "activeProfileId"]);
      setToken(null);
    } catch (error) {
      console.error("Could not log out:", error);
      setStorageError("Uloskirjautuminen epäonnistui.");
    }
  };
  const handleUnauthorized = useCallback(() => {
    setToken(null);
    void chrome.storage.local.remove("authToken").catch((error: unknown) => {
      console.error("Could not clear expired login:", error);
    });
  }, []);

  if (loading) {
    return <p className="p-6 text-center">Ladataan...</p>;
  }

  if (!token) {
    return (
      <>
        {storageError && <p role="alert">{storageError}</p>}
        <Login
          onAuthenticated={(newToken) => {
            setStorageError("");
            setToken(newToken);
          }}
        />
      </>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-text">
        <NavBar onLogout={logout} />
        <Home
          token={token}
          onUnauthorized={handleUnauthorized}
        />
        {storageError && <p role="alert">{storageError}</p>}
      </div>
    </ThemeProvider>
  );
}

export default App;
