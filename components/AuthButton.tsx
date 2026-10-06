"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { LogIn, LogOut } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { signOut } from "@/app/actions";
import { User } from "@supabase/supabase-js";
import { useFormStatus } from "react-dom";

interface AuthButtonProps {
  user: User | null;
}

const AuthButton = ({ user }: AuthButtonProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  function SignOutButton() {
    const { pending } = useFormStatus();

    return (
      <Button
        variant="ghost"
        size="sm"
        type="submit"
        disabled={pending}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        {pending ? "Signing out..." : "Sign out"}
      </Button>
    );
  }

  if (user) {
    return (
      <form action={signOut}>
        <Button variant="ghost" size="sm" type="submit" className="gap-2">
          <SignOutButton />
        </Button>
      </form>
    );
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 gap-2"
        onClick={() => setShowAuthModal(true)}
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default AuthButton;
