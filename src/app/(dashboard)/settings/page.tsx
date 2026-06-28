"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, Mail, Shield, User } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { WorkspaceSwitcher } from "@/components/shared/workspace-switcher";
import { CreateOrganizationDialog } from "@/components/shared/create-organization-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/store/auth-store";
import { organizationsService } from "@/services/organizations.service";
import { useWorkspace } from "@/hooks/use-workspace";
import { getInitials, truncateId } from "@/lib/utils";

export default function SettingsPage() {
  const { email, userId, roles, organizationId: jwtOrgId } = useAuth();
  const { organizationId } = useWorkspace();
  // Only users who don't yet belong to an organization can create one.
  // (The backend rejects org creation for users who already have one.)
  const canCreateOrg = !jwtOrgId;

  const orgQ = useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => organizationsService.get(organizationId!),
    enabled: Boolean(organizationId),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, organization, and security preferences."
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="profile">
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="size-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback>{getInitials(email ?? "U")}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="font-medium">{email ?? "—"}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {userId ? truncateId(userId) : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email" icon={Mail} value={email ?? "—"} />
                <Field
                  label="Roles"
                  icon={Shield}
                  valueNode={
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {roles.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No roles assigned</span>
                      ) : (
                        roles.map((r) => (
                          <Badge key={r} variant="secondary">
                            {r.replaceAll("_", " ")}
                          </Badge>
                        ))
                      )}
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle>Active workspace</CardTitle>
                <CardDescription>
                  Choose which org/instance/group context the app should use.
                </CardDescription>
              </div>
              {canCreateOrg && <CreateOrganizationDialog />}
            </CardHeader>
            <CardContent>
              <WorkspaceSwitcher />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization details</CardTitle>
            </CardHeader>
            <CardContent>
              {!organizationId ? (
                <p className="text-sm text-muted-foreground">
                  Select an organization above.
                </p>
              ) : orgQ.isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name" value={orgQ.data?.name ?? "—"} />
                  <Field
                    label="Description"
                    value={orgQ.data?.description ?? "—"}
                  />
                  <Field
                    label="Org ID"
                    value={truncateId(organizationId)}
                    mono
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Token-based auth with HttpOnly refresh cookies and silent rotation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Access tokens rotate every 15 minutes by default.</p>
              <p>• Refresh tokens live in HttpOnly Secure cookies.</p>
              <p>• Sign out clears local credentials and revokes the refresh token.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
  mono,
  valueNode,
}: {
  label: string;
  value?: string;
  icon?: typeof User;
  mono?: boolean;
  valueNode?: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      {valueNode ? (
        valueNode
      ) : (
        <p className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
      )}
    </div>
  );
}
