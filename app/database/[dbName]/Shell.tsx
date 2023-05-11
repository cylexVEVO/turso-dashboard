"use client";

import { createClient, type Client, type ResultSet, LibsqlError } from "@libsql/client/web";
import { useRef, useState } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

export const Shell = ({hostname}: {hostname: string}) => {
    const [token, setToken] = useState("");
    const [connClosed, setConnClosed] = useState(true);
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<ResultSet | null>(null);
    const [error, setError] = useState<LibsqlError | null>(null);
    const [queryTime, setQueryTime] = useState(0);
    const [querying, setQuerying] = useState(false);

    const client = useRef<Client | null>(null);

    const connect = () => {
        resetState();
        client.current = createClient({
            url: `https://${hostname}`,
            authToken: token
        });
        setConnClosed(client.current.closed);
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
        if (!client.current) return;
        client.current.close();
        resetState();
        setToken("");
    };

    const execute = async () => {
        if (!client.current) return;
        setConnClosed(client.current.closed);
        if (client.current.closed) return;
        const queryStart = new Date();
        setQuerying(true);
        console.log(`<< ${query}`);
        try {
            const res = await client.current.execute(query);
            setError(null);
            setResult(res);
            console.log(">>", res);
        } catch (e) {
            setResult(null);
            setError(e as LibsqlError);
            console.error(">>", e);
        }
        setQueryTime(+new Date() - +queryStart);
        setQuerying(false);
    };

    if (!connClosed) {
        return (
            <div className="rounded-lg border border-neutral-300 dark:border-neutral-700">
                <div className="flex border-b border-neutral-300 dark:border-neutral-700">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && execute()}
                        placeholder="Enter a query..."
                        className="bg-transparent grow py-2 px-3 font-mono outline-none"
                        id="query-input"
                        autoFocus />
                    <button onClick={execute} className="py-2 px-4 border-l border-neutral-300 dark:border-neutral-700 min-w-[93.43px] flex justify-center items-center">
                        {querying ? <Spinner size={16}/> : "Execute"}
                    </button>
                </div>
                <div className="flex items-center px-3 py-2 text-sm text-black/75 dark:text-white/75 gap-1 border-b border-neutral-300 dark:border-neutral-700">
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
                                <tr key={ri} className="border-t border-neutral-200 dark:border-neutral-900">
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

    return (
        <div className="rounded-lg border border-neutral-300 dark:border-neutral-700 flex">
            <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connect()}
                placeholder="Enter token to connect..."
                className="rounded-l-lg bg-transparent border-neutral-300 dark:border-neutral-700 grow py-2 px-3 font-mono outline-none" />
            <button onClick={connect} className="border-l border-neutral-300 dark:border-neutral-700 py-2 px-4">
                Connect
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