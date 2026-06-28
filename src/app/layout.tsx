import type { Metadata, Viewport } from "next";

import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { APP_DESCRIPTION, APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Asset tracking, end-to-end`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-svh bg-background font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
