import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Globe2,
  LineChart,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { APP_NAME, ROUTES } from "@/constants";

const features = [
  {
    icon: Workflow,
    title: "Lifecycle state machine",
    description:
      "Every ticket flows through a strict state machine — Created → Packed → In-transit → Delivered → Received — with full guardrails.",
  },
  {
    icon: Globe2,
    title: "Multi-tenant by design",
    description:
      "Organizations, instances, groups, and locations. Built for fleets, depots and partners — without messy data leaks.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access control",
    description:
      "Org admins, store maintainers, shift personnel and auditors — each with their own scope and audit trail.",
  },
  {
    icon: LineChart,
    title: "Movement-level audit",
    description:
      "Every sack and asset movement is recorded — who did what, when, and from where, with first-class observability.",
  },
];

const flow = ["Created", "Packed", "Picked up", "In transit", "Delivered", "Received"];

export default function HomePage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      {/* Background ornament */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-indigo-100/60 via-background to-background dark:from-indigo-950/30" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_top,theme(colors.indigo.500/10),transparent_60%)]"
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#flow" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#pricing" className="hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={ROUTES.LOGIN}>Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={ROUTES.REGISTER}>
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-indigo-500" />
              Now in private beta · v0.1
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Track every ticket
              <br />
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                from creation to delivery.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              {APP_NAME} is an asset & sack tracking platform purpose-built for
              multi-site logistics teams. Move fast, stay auditable, and never lose a
              ticket again.
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.REGISTER}>
                  Start tracking free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={ROUTES.LOGIN}>Sign in to dashboard</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              No credit card required · SOC2-ready architecture
            </p>
          </div>

          {/* Mock dashboard preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative rounded-2xl border bg-card p-2 shadow-2xl shadow-indigo-500/5">
              <div className="flex items-center gap-1.5 border-b px-3 py-2.5">
                <span className="size-2.5 rounded-full bg-red-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs text-muted-foreground">
                  app.gtrack.io / dashboard
                </span>
              </div>
              <div className="grid grid-cols-12 gap-4 p-4 sm:p-6">
                <div className="col-span-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
                  {[
                    { label: "Total assets", value: "12,403" },
                    { label: "In transit", value: "841" },
                    { label: "Delivered today", value: "127" },
                    { label: "Open issues", value: "3" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg border bg-background p-3"
                    >
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="mt-1 text-xl font-semibold">{s.value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 row-span-2 rounded-lg border bg-background p-4 sm:col-span-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Movement flow</p>
                      <span className="text-xs text-muted-foreground">Last 24h</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      {flow.map((step, i) => (
                        <div
                          key={step}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <div
                            className={`h-1.5 w-full rounded-full ${
                              i < 4 ? "bg-indigo-500" : "bg-muted"
                            }`}
                          />
                          <p className="hidden text-[10px] text-muted-foreground sm:block">
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { k: "Packed", v: "204" },
                        { k: "Picked up", v: "187" },
                        { k: "In transit", v: "162" },
                        { k: "Delivered", v: "127" },
                      ].map((c) => (
                        <div key={c.k}>
                          <p className="text-[11px] text-muted-foreground">{c.k}</p>
                          <p className="text-sm font-semibold">{c.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-span-12 rounded-lg border bg-background p-4 lg:col-span-4">
                  <p className="text-sm font-medium">Recent activity</p>
                  <ul className="mt-3 space-y-2.5 text-xs">
                    {[
                      "TCKT-1029 marked DELIVERED",
                      "Sack #84 picked up",
                      "TCKT-1027 packed by Asha",
                      "Group ‘North Depot’ created",
                      "TCKT-1024 received",
                    ].map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-500" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for teams that can&apos;t afford to lose a ticket.
              </h2>
              <p className="mt-3 text-muted-foreground">
                A focused toolkit for asset operations — from depot to doorstep.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="group rounded-xl border bg-background p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="grid size-10 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              A clean, opinionated lifecycle.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every state transition is validated server-side, audited, and reversible
              where it makes sense.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm">
              {flow.map((step, i) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full border bg-background px-3 py-1.5 font-medium shadow-sm">
                    {step}
                  </span>
                  {i < flow.length - 1 && (
                    <ArrowRight className="size-4 text-muted-foreground" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className="border-t py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 mx-auto">
              <Boxes className="size-6" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to take control of your fleet?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Spin up an organization in under a minute. Invite your team, define your
              locations, and start tracking.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.REGISTER}>
                  Create your organization
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={ROUTES.LOGIN}>Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo showText={false} />
            <span>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
