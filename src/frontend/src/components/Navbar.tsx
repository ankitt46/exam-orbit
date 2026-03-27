import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Rocket, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "PYQs", to: "/pyqs" },
  { label: "Tests", to: "/tests" },
  { label: "Study Material", to: "/study-material" },
  { label: "Leaderboard", to: "/leaderboard" },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-primary"
          >
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </span>
            <span>Exam Orbit</span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            data-ocid="nav.list"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                activeProps={{
                  className: "text-primary font-semibold bg-secondary",
                }}
                data-ocid={`nav.${link.label.toLowerCase().replace(" ", "_")}.link`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
              aria-label="Toggle dark mode"
              data-ocid="nav.theme.toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAuthOpen(true)}
              data-ocid="nav.login.button"
            >
              Login
            </Button>
            <Button
              size="sm"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold"
              onClick={() => setAuthOpen(true)}
              data-ocid="nav.get_started.button"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-ocid="nav.mobile_menu.toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1"
            data-ocid="nav.mobile_menu.panel"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                onClick={() => setMobileOpen(false)}
                data-ocid={`nav.mobile.${link.label.toLowerCase().replace(" ", "_")}.link`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-secondary text-muted-foreground"
                data-ocid="nav.mobile.theme.toggle"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAuthOpen(true);
                  setMobileOpen(false);
                }}
                data-ocid="nav.mobile.login.button"
              >
                Login
              </Button>
              <Button
                size="sm"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white"
                onClick={() => {
                  setAuthOpen(true);
                  setMobileOpen(false);
                }}
                data-ocid="nav.mobile.get_started.button"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
