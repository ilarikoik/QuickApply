import "./App.css";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ThemeProvider } from "./theme/ThemeContext";

function App() {
  // const user = true;
  const user = false;
  if (!user) {
    return <Login />;
  }
  return (
    <ThemeProvider>
      <div className="min-h-100 bg-background text-text">
        <NavBar />
        <Home />
      </div>
    </ThemeProvider>
  );
}

export default App;
