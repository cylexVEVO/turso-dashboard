"use client";

import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { useState } from "react"

export const ConnectionUrl = ({hostname}: {hostname: string}) => {
    const [protocol, setProtocol] = useState("libsql");
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(`${protocol}://${hostname}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
    };

    return (
        <div>
            <div className="opacity-75 text-sm mb-1">
                Connection URL
            </div>
            <div className="font-mono rounded-lg flex w-full bg-[#f9f9f9] dark:bg-accent2Dark border border-borderLight dark:border-borderDark">
                <select
                    className="bg-transparent p-2 pl-3 border-r border-borderLight dark:border-borderDark"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}>
                    <option value="libsql">libsql://</option>
                    <option value="http">http://</option>
                    <option value="https">https://</option>
                </select>
                <div className="grow whitespace-nowrap overflow-x-scroll p-2 px-3 pr-8 ">
                    {hostname}
                </div>
                <div className="flex justify-center h-[42px] w-[42px]">
                    <button
                        className="transition ease-in-out duration-200 opacity-50 hover:opacity-100"
                        onClick={copy}>
                        {!copied &&
                            <ClipboardDocumentIcon className="w-5 h-5" />
                        }
                        {copied &&
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};