"use client";

import { createToken } from "@/app/_actions";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
    const params = useParams() as { dbName: string };
    const router = useRouter();
    const [expires, setExpires] = useState(true);
    const [readOnly, setReadOnly] = useState(true);
    const [token, setToken] = useState("");
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (params === null) return null;

    const copy = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
    };

    if (token) {
        return (
            <>
                <div onClick={() => router.back()} className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn cursor-default" />
                <div className="animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg">
                    <button onClick={() => router.back()} className="absolute top-4 right-4 h-6 w-6 opacity-50 hover:opacity-100 transition ease-in-out duration-200">
                        <XMarkIcon />
                    </button>
                    <div className="text-3xl font-bold mb-4">
                        Create Token
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        Your token is:
                        <div className={"flex mt-2"}>
                            <div className={"border-l border-y border-neutral-300 dark:border-neutral-700 py-2 px-3 font-mono rounded-l-lg overflow-auto whitespace-nowrap"}>
                                {token}
                            </div>
                            <button
                                className={`border border-neutral-300 dark:border-neutral-700 py-2 px-4 rounded-r-lg ${copied ? "text-green-700 dark:text-green-500" : ""}`}
                                onClick={copy}>
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>
                    <div className={"flex justify-end"}>
                        <button onClick={() => router.back()} className={"px-4 py-2 rounded-lg text-white bg-neutral-500 hover:bg-neutral-400 active:bg-neutral-600 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:active:bg-neutral-700 transition ease-in-out duration-200"}>
                            Close
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div onClick={() => router.back()} className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn cursor-default" />
            <div className="animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg">
                <button onClick={() => router.back()} className="absolute top-4 right-4 h-6 w-6 opacity-50 hover:opacity-100 transition ease-in-out duration-200">
                    <XMarkIcon />
                </button>
                <div className="text-3xl font-bold mb-4">
                    Create Token
                </div>
                <div className="flex flex-col gap-2 mb-4">
                    <fieldset className={"flex items-center gap-2"}>
                        <input id={"expires"} type={"checkbox"} checked={expires} onChange={(e) => setExpires(e.target.checked)} />
                        <label htmlFor={"expires"} className={"text-sm opacity-75"}>
                            Expires?
                        </label>
                    </fieldset>
                    <fieldset className={"flex items-center gap-2"}>
                        <input id={"readonly"} type={"checkbox"} checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
                        <label htmlFor={"readonly"} className={"text-sm opacity-75"}>
                            Read only?
                        </label>
                    </fieldset>
                </div>
                <div className={"flex justify-end"}>
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            const res = await createToken({ database: params.dbName, expires, readOnly });
                            setIsLoading(false);
                            if (typeof res === "object") return setToken(res.jwt);
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