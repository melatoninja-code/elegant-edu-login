import { cn } from "@/lib/utils";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const AuthCard = ({ children, className, ...props }: AuthCardProps) => {
  return (
    <div
      className={cn(
        "bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeIn",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AuthCard;