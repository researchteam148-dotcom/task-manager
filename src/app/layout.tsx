import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ForcedPasswordWrapper } from "@/components/auth/forced-password-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Task Planner - Departmental Staff Management",
    description: "Efficient task planning and management system for departmental staff coordination",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <ForcedPasswordWrapper>
                        {children}
                    </ForcedPasswordWrapper>
                </AuthProvider>
            </body>
        </html>
    );
}
