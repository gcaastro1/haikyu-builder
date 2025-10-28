"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

type FeedbackToastProps = {
  message: string;
  type: "success" | "error";
};

export function FeedbackToast({ message, type }: FeedbackToastProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 right-6 z-[80] rounded-lg shadow-lg px-4 py-3 flex items-center gap-2
      ${isSuccess ? "bg-emerald-600/95" : "bg-red-600/95"} text-white`}
      role="status"
      aria-live="polite"
    >
      {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="font-medium">{message}</span>
    </div>
  );
}
