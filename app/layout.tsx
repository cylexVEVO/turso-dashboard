import { Inter } from "next/font/google";
import "../styles/globals.css";

export const metadata = {
    title: "Turso Dashboard"
};

const inter = Inter({ subsets: ["latin"] });

export default function Layout({children, databases}: {children: React.ReactNode, databases: React.ReactNode}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <main className="container mx-auto py-8">
                    {children}
                    {databases}
                </main>
            </body>
        </html>
    );
}