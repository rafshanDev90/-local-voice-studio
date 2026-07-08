import "~/styles/globals.css";

import { type Metadata } from "next";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Rajshahi Voice Studio",
  description: "Local AI-powered voice and media tools",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
