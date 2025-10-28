"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import "@/styles/components/_feedback-toast.scss";

type FeedbackToastProps = {
  message: string;
  type: "success" | "error";
};

export function FeedbackToast({ message, type }: FeedbackToastProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`feedback-toast ${isSuccess ? "success" : "error"}`}
      role="status"
      aria-live="polite"
    >
      {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="feedback-toast__message">{message}</span>
    </div>
  );
}
