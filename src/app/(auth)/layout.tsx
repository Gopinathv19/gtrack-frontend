import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      <div className="absolute right-3 top-3 z-10 lg:right-6 lg:top-6">
        <ThemeToggle />
      </div>
      <div className="flex flex-col px-4 py-8 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <a href="#" className="underline-offset-4 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline-offset-4 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:block">
        <div
          aria-hidden
          className="absolute inset-0 [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.18),transparent_45%)]"
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 font-semibold">
            <Logo className="[&_span:last-child]:text-white" />
          </div>
          <blockquote className="max-w-md space-y-4">
            <p className="text-2xl font-medium leading-snug">
              “Track your tickets seamlessly with Gtrack. No more lost assets, no more headaches. Just keep shipping in a faster and more efficient way.”
            </p>
            <footer className="text-sm text-white/80">
              — Operations Lead, regional logistics partner
            </footer>
          </blockquote>
          <div className="text-xs text-white/70">
            © {new Date().getFullYear()} Gtrack — Built for operators.
          </div>
        </div>
      </div>
    </div>
  );
}
