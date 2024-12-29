"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomConnectButton } from "@/components/ui/CustomConnectButton";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white">
            <header className="bg-black text-white">
                <div className="container mx-auto py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/markets">
                            <h1 className="font-bold text-2xl flex items-center gap-2">
                                <span className="text-neo-green">😤</span>
                                <span className="text-neo-green">radish.xyz</span>
                            </h1>
                        </Link>
                        <nav className="flex items-center gap-8">
                            <Link href="/markets">
                                <span className="text-white hover:text-neo-green transition-colors">Markets</span>
                            </Link>
                            <Link href="/my-predictions">
                                <span className="text-white hover:text-neo-green transition-colors">My Positions</span>
                            </Link>
                            <CustomConnectButton />
                        </nav>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8">
                {children}
            </main>
        </div>
    );
}