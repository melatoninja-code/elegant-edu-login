import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import './index.css';
import Index from './pages/Index';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Classrooms from './pages/Classrooms';
import Calendar from './pages/Calendar';

// Create a wrapper component to handle auth state
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Protect routes that require authentication
  if (!session && window.location.pathname !== '/' && window.location.pathname !== '/signup') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/teachers",
    element: <Teachers />,
  },
  {
    path: "/classrooms",
    element: <Classrooms />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SidebarProvider>
      <AuthWrapper>
        <RouterProvider router={router} />
      </AuthWrapper>
    </SidebarProvider>
  </QueryClientProvider>
);