import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, LogIn, LogOut, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, clear, loginStatus, identity, isLoggingIn } =
    useInternetIdentity();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal().toString();

  const handleLogin = () => {
    login();
    onClose();
  };

  const handleLogout = () => {
    clear();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="auth.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isLoggedIn ? "Your Account" : "Welcome to Exam Orbit"}
          </DialogTitle>
          <DialogDescription>
            {isLoggedIn
              ? "You are securely logged in via Internet Identity."
              : "Sign in to track progress, save bookmarks, and compete on the leaderboard."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Logged In</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {principal}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
                data-ocid="auth.logout.button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 rounded-lg bg-secondary/60 text-sm text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">
                  Secure login with Internet Identity
                </p>
                <p>
                  No passwords required. Your identity is cryptographically
                  secure and private.
                </p>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={handleLogin}
                disabled={isLoggingIn}
                data-ocid="auth.login.button"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isLoggingIn ? "Connecting..." : "Sign In"}
              </Button>
              {loginStatus === "loginError" && (
                <p
                  className="text-sm text-destructive text-center"
                  data-ocid="auth.error_state"
                >
                  Login failed. Please try again.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
