"use client";

import { createInstance } from "@/app/_actions";
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
    const [region, setRegion] = useState("lax");
    const [version, setVersion] = useState("latest");
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
                    Create Instance
                </div>
                <div className="flex flex-col gap-2 mb-4">
                    <fieldset className={"flex flex-col gap-1"}>
                        <label htmlFor={"region"} className={"text-sm opacity-75"}>
                            Region
                        </label>
                        <select
                            id={"region"}
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-600 bg-transparent"}>
                            {regions.map((region) => (
                                <option value={region} key={region}>{region}</option>
                            ))}
                        </select>
                    </fieldset>
                    <fieldset className={"flex flex-col gap-1"}>
                        <label htmlFor={"version"} className={"text-sm opacity-75"}>
                            Version
                        </label>
                        <select
                            id={"version"}
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-600 bg-transparent"}>
                            <option value={"latest"}>Latest</option>
                            <option value={"canary"}>Canary</option>
                        </select>
                    </fieldset>
                </div>
                <div className={"flex justify-end"}>
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            const res = await createInstance({ dbName: params.dbName, region: region as Region, image: version as "latest" | "canary" });
                            setIsLoading(false);
                            if (res === undefined) {
                                router.refresh();
                                return router.back()
                            };
                            window.alert(res);
                        }}
                        className={"px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}
                        disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </>
    )
}