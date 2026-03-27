import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { SiInstagram, SiX, SiYoutube } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );

  return (
    <footer className="bg-secondary/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-lg text-primary mb-3"
            >
              <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </span>
              Exam Orbit
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your launchpad for JEE Main &amp; NEET success. Smart preparation,
              real results.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Prepare</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/pyqs"
                  className="hover:text-primary transition-colors"
                >
                  Previous Year Questions
                </Link>
              </li>
              <li>
                <Link
                  to="/tests"
                  className="hover:text-primary transition-colors"
                >
                  Mock Tests
                </Link>
              </li>
              <li>
                <Link
                  to="/study-material"
                  className="hover:text-primary transition-colors"
                >
                  Study Material
                </Link>
              </li>
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Exams</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>JEE Main</li>
              <li>NEET UG</li>
              <li>Physics, Chemistry, Maths, Biology</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Follow Us</h4>
            <div className="flex gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="X"
              >
                <SiX className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="YouTube"
              >
                <SiYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>&copy; {year} Exam Orbit. All rights reserved.</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with &hearts; using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
