import AuthCard from "@/components/AuthCard";
import SignupForm from "@/components/SignupForm";

const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-dark mb-2">
            Join EduSchool
          </h1>
          <p className="text-neutral">Create your account to get started</p>
        </div>

        <AuthCard>
          <SignupForm />
        </AuthCard>

        <p className="text-center text-sm text-neutral mt-4">
          Already have an account?{" "}
          <a
            href="/"
            className="text-primary hover:text-primary-dark font-semibold"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;