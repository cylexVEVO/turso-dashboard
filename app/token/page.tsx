"use client";

import { useState } from "react";
import { setCookie } from "../_actions";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button";

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
            <div className="text-lg font-medium mb-2">
                Please enter your Turso token below. You can get your token by running <code className="p-1 rounded-md bg-neutral-200 border border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600">turso auth token</code> in your terminal.
            </div>
            <fieldset className="flex flex-col gap-1 mb-4">
                <label htmlFor="token" className="text-sm opacity-75">
                    Token
                </label>
                <input
                    id="token"
                    placeholder="Turso token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="transition ease-in-out duration-200 rounded-lg py-2 px-3 bg-accent2Light dark:bg-accent2Dark" />
            </fieldset>
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        setCookie({token: token}).then(() => {
                            router.push("/");
                        });
                    }}>
                    Set token
                </Button>
            </div>
        </>
    );
}