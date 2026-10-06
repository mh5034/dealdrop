"use client";

import { demoSignIn } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DemoMessageProps {
  user: User | null;
}

export default function DemoMessage({ user }: DemoMessageProps) {
  const [demoOpen, setDemoOpen] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setDemoLoading(false);
    }
  }, [user]);

  if (user || !demoOpen) {
    return null;
  }

  const handleDemoLogin = async () => {
    if (demoLoading) return;

    setDemoLoading(true);

    try {
      await demoSignIn();
      router.refresh();
    } catch (error) {
      console.error("Error signing in as demo user:", error);
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 border-b border-orange-100 bg-orange-50/60 px-4 py-2 text-sm text-gray-700">
      <span>Want to explore first?</span>

      <button
        disabled={demoLoading}
        onClick={handleDemoLogin}
        className="font-medium text-orange-600 hover:text-orange-700 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      >
        {demoLoading ? "Signing in..." : "Try the demo"}
      </button>

      <button
        onClick={() => setDemoOpen(false)}
        className="ml-1 rounded-md p-1 text-gray-500 transition-colors hover:bg-orange-100 hover:text-gray-900"
        aria-label="Close demo message"
      >
        <X size={15} />
      </button>
    </div>
  );
}
