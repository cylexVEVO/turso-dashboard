"use client";

import { type ResultSet } from "@libsql/client/web";
import { useState } from "react";
import { BoltIcon, CheckIcon, ChevronRightIcon, PlayIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { createToken, shellProxy } from "@/app/_actions";

export const Shell = ({hostname, dbName}: {hostname: string, dbName: string}) => {
    const [token, setToken] = useState("");
    const [connClosed, setConnClosed] = useState(true);
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<ResultSet | null>(null);
    const [error, setError] = useState<{ code: string, message: string } | null>(null);
    const [queryTime, setQueryTime] = useState(0);
    const [querying, setQuerying] = useState(false);
    const [connMode, setConnMode] = useState<"auto" | "manual">("auto");

    const connect = () => {
        resetState();
        setConnClosed(false);
    };

    const autoConnect = async () => {
        const res = await createToken({ database: dbName, expires: true, readOnly: false });
        if (typeof res !== "object") return window.alert(res);
        setToken(res.jwt);
        connect();
    };

    const resetState = () => {
        setQuery("");
        setResult(null);
        setError(null);
        setConnClosed(true);
        setQueryTime(0);
        setQuerying(false);
    };

    const disconnect = () => {
        resetState();
        setToken("");
    };

    const execute = async () => {
        setQuerying(true);
        console.log(`<< ${query}`);
        const res = await shellProxy({
            token,
            url: `https://${hostname}`,
            query
        });
        // @ts-expect-error checking for error to do logic
        if (res.res.code === undefined) {
            setError(null);
            setResult(res.res as ResultSet);
            console.log(`>> ${query}\n`, res.res);
        } else {
            setResult(null);
            setError(res.res as { code: string, message: string });
            console.error(`>> ${query}\n`, res.res);
        }
        setQueryTime(res.time);
        setQuerying(false);
    };

    if (!connClosed) {
        return (
            <div className="rounded-xl border border-borderLight dark:border-borderDark bg-accentLight dark:bg-accentDark shadow-sm">
                <div className="flex border-b border-borderLight dark:border-borderDark">
                    <div className="flex flex-col w-full border-r border-borderLight dark:border-borderDark">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && execute()}
                            placeholder="Enter a query..."
                            className="rounded-l-lg bg-transparent grow p-3 font-mono outline-none "
                            id="query-input"
                            autoFocus />
                        <div className="flex items-center px-3 pb-2 -mt-3 text-sm text-black/75 dark:text-white/75 gap-1">
                            {!(result || error) &&
                                "No results yet"
                            }
                            {(result || error) &&
                                <>
                                    {result && <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />}
                                    {error && <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-500 mr-1" />}
                                    <div>Took {queryTime} ms</div>
                                    -
                                    <div>{result?.rowsAffected ?? 0} rows affected</div>
                                </>
                            }
                        </div>
                    </div>
                    <button onClick={execute} className="py-2 px-4 flex min-w-[52px] justify-center items-center transition ease-in-out duration-200 opacity-50 hover:opacity-100">
                        {querying ? <Spinner size={16}/> : <BoltIcon className="w-5 h-5" />}
                    </button>
                </div>
                {!(result || error) &&
                    <div className="opacity-75 text-sm p-3">
                        Execute a query to see results...
                    </div>
                }
                {error && 
                    <div className="font-mono p-3 text-red-600 dark:text-red-500">
                        {error.message}
                    </div>
                }
                {result && result?.columns.length === 0 &&
                    <div className="opacity-75 text-sm px-3 pt-3">
                        Empty result
                    </div>
                }
                {result && 
                    <table className="w-full border-collapse border-spacing-y-1 mb-2 mt-1">
                        <thead>
                            <tr>
                                {result!.columns.map((column) => 
                                    <th key={column} className="pl-4 text-left font-normal opacity-75 pb-2 pt-1">{column}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {result!.rows.map((row, ri) => 
                                <tr key={ri} className="border-t border-borderLight dark:border-borderDark">
                                    {Object.keys(row).map((key, ki) => 
                                        <td className="pl-4 pt-2 pb-2" key={`${ri}-${ki}`}>{row[key]?.toString()}</td>
                                    )}
                                </tr>
                            )}
                        </tbody>
                    </table>
                }
            </div>
        );
    }

    if (connMode === "auto") {
        return (
            <div className="rounded-xl border border-borderLight dark:border-borderDark bg-accentLight dark:bg-accentDark shadow-sm flex flex-col">
                <button onClick={autoConnect} className="py-3 px-4 transition ease-in-out duration-200 opacity-50 hover:opacity-100 flex items-center gap-2">
                    <PlayIcon className="w-4 h-4" />
                    Connect
                </button>
                <button
                    className="transition ease-in-out duration-200 opacity-50 hover:opacity-100 flex items-center gap-1 px-4 pb-2 text-sm"
                    onClick={() => setConnMode("manual")}>
                    Enter token manually
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-borderLight dark:border-borderDark bg-accentLight dark:bg-accentDark shadow-sm flex">
            <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connect()}
                placeholder="Enter token to connect..."
                className="rounded-l-lg bg-transparent grow p-3 font-mono outline-none border-r border-borderLight dark:border-borderDark" />
            <button onClick={connect} className="py-2 px-4 transition ease-in-out duration-200 opacity-50 hover:opacity-100">
                <PlayIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export const Spinner = ({size = 32}) => {
    return (
        <svg width={size} height={size} viewBox="0 0 337 337" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
            <path d="M169 336.999C168.833 337 168.667 337 168.5 337C75.4399 337 0 261.56 0 168.5C0 75.4399 75.4399 0 168.5 0C261.56 0 337 75.4399 337 168.5C337 168.667 337 168.833 336.999 169H298C298 97.7554 240.245 40 169 40C97.7554 40 40 97.7554 40 169C40 240.245 97.7554 298 169 298V336.999Z" fill="currentColor" />
        </svg>
    );
};