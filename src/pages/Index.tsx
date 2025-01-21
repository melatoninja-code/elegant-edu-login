import { useState } from "react";
import AuthCard from "@/components/AuthCard";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-dark mb-2">
            Welcome to EduSchool
          </h1>
          <p className="text-neutral">Your journey to knowledge starts here</p>
        </div>

        <AuthCard>
          <div className="flex gap-4 mb-8">
            <Button
              variant={isLogin ? "default" : "outline"}
              className={`flex-1 ${
                isLogin ? "bg-primary hover:bg-primary-dark" : ""
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? "default" : "outline"}
              className={`flex-1 ${
                !isLogin ? "bg-primary hover:bg-primary-dark" : ""
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </Button>
          </div>

          {isLogin ? <LoginForm /> : <SignupForm />}
        </AuthCard>

        <p className="text-center text-sm text-neutral mt-4">
          {isLogin
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary-dark font-semibold"
          >
            {isLogin ? "Sign up here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Index;