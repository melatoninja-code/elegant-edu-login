import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import "./App.css";
import SignupForm from "./components/SignupForm";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Routes, Route } from "react-router-dom";
import Assignments from "./pages/Assignments";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={
            <main className="min-h-screen bg-background flex items-center justify-center p-4">
              <div className="w-full max-w-md">
                <SignupForm />
              </div>
            </main>
          } />
          <Route path="/assignments" element={<Assignments />} />
        </Routes>
      </SidebarProvider>
      <Toaster />
    </Router>
  );
}

export default App;