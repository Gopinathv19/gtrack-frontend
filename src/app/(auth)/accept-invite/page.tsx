"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  acceptInviteSchema,
  type AcceptInviteFormValues,
} from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants";

function AcceptInviteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const form = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (v: AcceptInviteFormValues) =>
      authService.acceptInvite({ token, name: v.name, password: v.password }),
    onSuccess: (tokens) => {
      // Backend signs a brand-new JWT that reflects the just-joined
      // organization (and any roles assigned by the invite). Replacing
      // the stored access token is enough — every subsequent request
      // will carry the updated `org_id` / `roles` claims, so an already-
      // logged-in user who was just added to an org no longer needs to
      // sign out and back in.
      setAccessToken(tokens.access_token);
      toast.success("Welcome aboard!");
      // Hard reload the dashboard so React Query caches keyed on the
      // previous (org-less) JWT are flushed and re-fetched against the
      // new tenant. router.replace() alone would keep stale queries
      // around.
      window.location.assign(ROUTES.DASHBOARD);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not accept invite"));
    },
  });

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Invalid invite link</h1>
        <p className="text-sm text-muted-foreground">
          The invite token is missing or malformed. Please ask your admin for a fresh
          invite.
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.LOGIN}>Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Accept your invite</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ve been invited to join an organization on Gtrack. Finish setting
          up your account.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
                <FormControl>
                  <Input placeholder="Ada Lovelace" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Accept invite
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-muted" />}>
      <AcceptInviteInner />
    </Suspense>
  );
}
