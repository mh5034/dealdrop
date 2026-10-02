"use client";
import { demoSignIn } from "@/app/actions";
import { Button } from "./ui/button";
import { User } from "@supabase/supabase-js";

interface DemoButtonProps {
  user: User | null;
}
export default function DemoButton({ user }: DemoButtonProps) {
  if (user) {
    return null;
  }
  return (
    <Button
      variant="default"
      size="sm"
      className="bg-orange-500 hover:bg-orange-600 gap-2 ml-auto mr-2"
      onClick={async () => {
        try {
          await demoSignIn();
        } catch (error) {
          console.error("Error signing in as demo user:", error);
        }
      }}
    >
      Demo Account
    </Button>
  );
}
