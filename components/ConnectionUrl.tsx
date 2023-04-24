import { useState } from "react"

export const ConnectionUrl = (props: {hostname: string}) => {
    const [protocol, setProtocol] = useState("libsql");
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(`${protocol}://${props.hostname}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
    };

    return (
        <>
            <div className={"text-xl font-medium mb-1"}>
                Connection URL
            </div>
            <div className={"mb-2 flex items-center"}>
                <select
                    className={"rounded-l-lg bg-transparent border border-neutral-300 dark:border-neutral-700 p-2 h-[42px] font-mono"}
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}>
                    <option value={"libsql"}>libsql://</option>
                    <option value={"http"}>http://</option>
                    <option value={"https"}>https://</option>
                </select>
                <div className={"border-y border-neutral-300 dark:border-neutral-700 grow py-2 px-3 font-mono"}>
                    {props.hostname}
                </div>
                <button
                    className={`border border-neutral-300 dark:border-neutral-700 py-2 px-4 rounded-r-lg ${copied ? "text-green-700 dark:text-green-500" : ""}`}
                    onClick={copy}>
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
        </>
    );
};