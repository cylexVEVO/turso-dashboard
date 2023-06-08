"use client";

import { createToken } from "@/app/_actions";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from "@heroicons/react/20/solid";
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
            <Modal.Root>
                <Modal.Title>
                    Create Token
                </Modal.Title>
                <Modal.Description>
                    <div className="mb-2">
                        Your token is:
                    </div>
                    <div className="relative">
                        <div className="bg-accent2Light dark:bg-accent2Dark rounded-lg whitespace-nowrap overflow-x-scroll p-2 px-3 pr-8 border border-borderLight dark:border-borderDark">
                            {token}
                        </div>
                        <div className="absolute -translate-y-1/2 right-0 top-1/2 flex justify-center bg-accent2Light dark:bg-accent2Dark h-[42px] w-[42px] rounded-r-lg">
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
                </Modal.Description>
                <Modal.Actions>
                    <Button onClick={() => router.back()} color="secondary">
                        Close
                    </Button>
                </Modal.Actions>
            </Modal.Root>
        );
    }

    return (
        <Modal.Root>
            <Modal.Title>
                Create Token
            </Modal.Title>
            <Modal.Fields>
                <fieldset className="flex items-center gap-2">
                    <input id="expires" type="checkbox" checked={expires} onChange={(e) => setExpires(e.target.checked)} />
                    <label htmlFor="expires" className="text-sm opacity-75">
                        Expires?
                    </label>
                </fieldset>
                <fieldset className="flex items-center gap-2">
                    <input id="readonly" type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
                    <label htmlFor="readonly" className="text-sm opacity-75">
                        Read only?
                    </label>
                </fieldset>
            </Modal.Fields>
            <Modal.Actions>
                <Button onClick={() => router.back()} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={async () => {
                        setIsLoading(true);
                        const res = await createToken({ database: params.dbName, expires, readOnly });
                        setIsLoading(false);
                        if (typeof res === "object") return setToken(res.jwt);
                        window.alert(res);
                    }}
                    disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create"}
                </Button>
            </Modal.Actions>
        </Modal.Root>
    );
}