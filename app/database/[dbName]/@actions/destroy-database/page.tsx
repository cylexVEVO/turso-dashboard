"use client";

import { destroyDatabase } from "@/app/_actions";
import { Region } from "@/turso";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const regions: string[] = [];

for (const enumKey in Region) {
    // take only strings (the region names)
    if (Number.isNaN(Number(enumKey))) regions.push(enumKey);
}

export default function Page() {
    const params = useParams() as { dbName: string };
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (params === null) return null;

    return (
        <>
            <div onClick={() => router.back()} className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn cursor-default" />
            <div className="animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg">
                <button onClick={() => router.back()} className="absolute top-4 right-4 h-6 w-6 opacity-50 hover:opacity-100 transition ease-in-out duration-200">
                    <XMarkIcon />
                </button>
                <div className="text-3xl font-bold mb-4">
                    Destroy Database
                </div>
                <div className="mb-4">
                    Are you sure you want to destroy the database? This will destroy all instances and delete all data.
                </div>
                <div className={"flex justify-end"}>
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            const res = await destroyDatabase({ database: params.dbName, token: process.env.NEXT_PUBLIC_TURSO_TOKEN! });
                            setIsLoading(false);
                            if (res === undefined) return router.push("/");
                            window.alert(res);
                        }}
                        className={"px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}
                        disabled={isLoading}>
                        {isLoading ? "Destroying..." : "Destroy"}
                    </button>
                </div>
            </div>
        </>
    )
}