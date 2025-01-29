import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/toaster";
import './index.css';

// Import all pages
import Index from './pages/Index';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Grades from './pages/Grades';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Classrooms from './pages/Classrooms';
import Calendar from './pages/Calendar';
import Bookings from './pages/Bookings';
import Assignments from './pages/Assignments';

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

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

// Create router with auth protection
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
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Dashboard />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/grades",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Grades />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/teachers",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Teachers />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/students",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Students />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/classrooms",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Classrooms />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/calendar",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Calendar />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/bookings",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Bookings />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
  {
    path: "/assignments",
    element: (
      <ProtectedRoute>
        <SidebarProvider>
          <Assignments />
        </SidebarProvider>
      </ProtectedRoute>
    ),
  },
]);

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

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

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </QueryClientProvider>
);
