import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import SignupForm from "./components/SignupForm";

function App() {
  return (
    <Router>
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </main>
      <Toaster />
    </Router>
  );
}

export default App;