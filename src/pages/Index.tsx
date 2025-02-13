import AuthCard from "@/components/AuthCard";
import LoginForm from "@/components/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-dark mb-2">
            Welcome Back
          </h1>
          <p className="text-neutral">Login to access your account</p>
        </div>

        <AuthCard>
          <LoginForm />
        </AuthCard>

        <p className="text-center text-sm text-neutral mt-4">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-primary hover:text-primary-dark font-semibold"
          >
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Index;