import "./globals.css";
import "./design.css"; // Versa design system — overrides the legacy base + defines .ds-* components
import type { ReactNode } from "react";

export const metadata = {
  title: "Versa Olympiads — Operations",
  description: "Versa Olympiads operations platform — built from semantic specs.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
