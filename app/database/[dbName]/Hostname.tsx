"use client";

import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export const Hostname = ({hostname}: {hostname: string}) => {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(hostname);
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
    };

    return (
        <div>
            <div className="opacity-75 text-sm -mb-1">
                Hostname
            </div>
            <div className="text-2xl font-bold flex items-center gap-2">
                {hostname}
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
    );
}