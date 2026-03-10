import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner = ({
  size = "md",
  className,
  ...props
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute h-full w-full animate-spin rounded-full border-solid border-t-transparent border-l-transparent border-r-transparent",
          "border-b-template-primary"
        )}
      />
      <div
        className={cn(
          "absolute h-full w-full rounded-full opacity-20",
          "border border-template-primary/30"
        )}
      />
    </div>
  );
};

export { LoadingSpinner };
