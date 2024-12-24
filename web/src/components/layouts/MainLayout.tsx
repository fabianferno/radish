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
    return <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
            <Link href="/markets">
                <h1 className="notebook-header font-bold text-3xl flex items-center gap-2">
                    <Image src="/logo.png" className="rounded-full w-20 h-20 -m-3" alt="radish" width={50} height={50} />
                    radish.xyz
                </h1>
            </Link>
            <div className="flex flex-row items-center gap-2">
                <Link href="/create">
                    <Button>Create Market</Button>
                </Link>
                <CustomConnectButton />
            </div>
        </div>

        <section className="container py-8">
            {children}
        </section>
    </main>
}