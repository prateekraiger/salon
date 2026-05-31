import toast from "react-hot-toast";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const triggerToast = ({ title, description, variant }: ToastProps) => {
    const message = [title, description].filter(Boolean).join(": ");
    if (variant === "destructive") {
      toast.error(message || "An error occurred");
    } else {
      toast.success(message || "Success");
    }
  };

  return {
    toast: triggerToast,
  };
}
