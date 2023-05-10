"use client";

import { useState } from "react";
import { setCookie } from "../_actions";
import { useRouter } from "next/navigation";

export default function Page() {
    const [token, setToken] = useState("");
    const router = useRouter();

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold">
                    Set token
                </div>
            </div>
            <div className="text-lg font-medium mb-4">
                Please enter your Turso token below. You can get your token by running <code className="p-1 rounded-md bg-neutral-200 border border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600">turso auth token</code> in your terminal.
            </div>
            <fieldset className={"flex flex-col gap-1 mb-4"}>
                <label htmlFor={"token"} className={"text-sm opacity-75"}>
                    Token
                </label>
                <input
                    id={"token"}
                    placeholder={"Turso token"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-600 bg-transparent"} />
            </fieldset>
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setCookie({token: token}).then(() => {
                            router.push("/");
                        });
                    }}
                    className={"px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}>
                    Set token
                </button>
            </div>
        </>
    );
}