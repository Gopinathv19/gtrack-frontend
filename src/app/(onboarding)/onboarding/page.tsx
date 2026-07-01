"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  organizationCreateSchema,
  type OrganizationCreateFormValues,
} from "@/schemas/organization.schema";
import { authService } from "@/services/auth.service";
import { organizationsService } from "@/services/organizations.service";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { getApiErrorMessage } from "@/lib/api-client";
import { ROUTES } from "@/constants";

const steps = [
  { key: "org", label: "Create organization" },
  { key: "instance", label: "Add an instance" },
  { key: "group", label: "Define your first group" },
];

export default function OnboardingPage() {
  useAuthGuard("protected");
  const router = useRouter();
  const setOrganization = useWorkspaceStore((s) => s.setOrganization);
  const setInstance = useWorkspaceStore((s) => s.setInstance);
  const setGroup = useWorkspaceStore((s) => s.setGroup);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [step, setStep] = useState(0);
  const [createdIds, setCreatedIds] = useState<{
    org?: string;
    instance?: string;
  }>({});

  const orgForm = useForm<OrganizationCreateFormValues>({
    resolver: zodResolver(organizationCreateSchema),
    defaultValues: { name: "", description: "" },
  });
  const instanceForm = useForm<{ name: string; description: string }>({
    defaultValues: { name: "", description: "" },
  });
  const groupForm = useForm<{ name: string; description: string }>({
    defaultValues: { name: "", description: "" },
  });

  const orgMut = useMutation({
    mutationFn: async (values: OrganizationCreateFormValues) => {
      const org = await organizationsService.create(values);
      // The user's org_id and ORG_ADMIN role were just set on the server,
      // but our access token still carries the pre-org claims. Rotate the
      // token so subsequent onboarding calls (create instance / group) run
      // under the new tenant and role — otherwise the user would have to
      // sign out and back in for the JWT to reflect their new membership.
      try {
        const tokens = await authService.refresh();
        setAccessToken(tokens.access_token);
      } catch {
        // Non-fatal; the axios 401 interceptor will refresh lazily.
      }
      return org;
    },
    onSuccess: (org) => {
      setCreatedIds((s) => ({ ...s, org: org.id }));
      setOrganization(org.id);
      toast.success("Organization created");
      setStep(1);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const instanceMut = useMutation({
    mutationFn: (v: { name: string; description?: string }) =>
      organizationsService.createInstance(createdIds.org!, v),
    onSuccess: (inst) => {
      setCreatedIds((s) => ({ ...s, instance: inst.id }));
      setInstance(inst.id);
      toast.success("Instance created");
      setStep(2);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const groupMut = useMutation({
    mutationFn: (v: { name: string; description?: string }) =>
      organizationsService.createGroup(createdIds.instance!, v),
    onSuccess: (g) => {
      setGroup(g.id);
      toast.success("You're all set!");
      router.replace(ROUTES.DASHBOARD);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="relative min-h-svh bg-muted/30">
      <div className="absolute right-3 top-3 z-10 lg:right-6 lg:top-6">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-svh max-w-2xl flex-col px-4 py-8 sm:px-6">
        <Logo />
        <div className="my-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Let&apos;s set up your workspace.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Three quick steps to start tracking assets and sacks.
          </p>
        </div>

        {/* Progress */}
        <ol className="mb-6 grid grid-cols-3 gap-2 text-xs">
          {steps.map((s, i) => (
            <li
              key={s.key}
              className={`rounded-md border px-3 py-2 ${
                i === step
                  ? "border-indigo-500/50 bg-indigo-500/5 text-foreground"
                  : i < step
                    ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              <p className="flex items-center gap-1.5 font-medium">
                {i < step ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                ) : (
                  <span className="grid size-3.5 place-items-center rounded-full bg-foreground/10 text-[10px]">
                    {i + 1}
                  </span>
                )}
                {s.label}
              </p>
            </li>
          ))}
        </ol>

        <Card>
          {step === 0 && (
            <>
              <CardHeader>
                <CardTitle>Create your organization</CardTitle>
                <CardDescription>
                  This is your top-level workspace. You can rename it later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...orgForm}>
                  <form
                    onSubmit={orgForm.handleSubmit((v) => orgMut.mutate(v))}
                    className="space-y-4"
                  >
                    <FormField
                      control={orgForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Logistics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optional)</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={orgMut.isPending}>
                      {orgMut.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Continue
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Add an instance</CardTitle>
                <CardDescription>
                  Instances let you separate environments — e.g. Production, Region
                  East, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...instanceForm}>
                  <form
                    onSubmit={instanceForm.handleSubmit((v) =>
                      instanceMut.mutate(v),
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={instanceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instance name</FormLabel>
                          <FormControl>
                            <Input placeholder="Production" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={instanceMut.isPending}>
                      {instanceMut.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Continue
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Define your first group</CardTitle>
                <CardDescription>
                  Groups are operational units — typically depots, regions, or
                  teams.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...groupForm}>
                  <form
                    onSubmit={groupForm.handleSubmit((v) => groupMut.mutate(v))}
                    className="space-y-4"
                  >
                    <FormField
                      control={groupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group name</FormLabel>
                          <FormControl>
                            <Input placeholder="North depot" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={groupMut.isPending}>
                      {groupMut.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Finish setup
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You can also <a className="underline-offset-4 hover:underline" href={ROUTES.DASHBOARD}>skip and explore</a>.
        </p>
      </div>
    </div>
  );
}
