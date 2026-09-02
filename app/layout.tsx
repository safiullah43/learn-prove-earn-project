import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Learn Prove Earn",
    description: "Learn. Prove. Earn.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}