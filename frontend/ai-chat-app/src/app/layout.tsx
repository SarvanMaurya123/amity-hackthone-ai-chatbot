import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luminous AI | Intelligent Chat Interface",
  description: "Advanced AI chat experience with glassmorphism design and streaming capabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{ colorScheme: "dark" }}
    >
      <body className="relative flex min-h-full flex-col overflow-x-hidden">
        <QueryProvider>{children}</QueryProvider>
        
        {/* Overlay Visual Accents */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" 
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10" 
        />
      </body>
    </html>
  );
}
