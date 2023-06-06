"use client";

import { createDatabase } from "@/app/_actions";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { Region, regions } from "@/turso";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [region, setRegion] = useState("lax");
    const [version, setVersion] = useState("latest");
    const [createInstance, setCreateInstance] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Modal.Root>
            <Modal.Title>
                Create Database
            </Modal.Title>
            <Modal.Fields>
                <fieldset className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-sm opacity-75">
                        Name
                    </label>
                    <input
                        id="name"
                        placeholder="Database Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="transition ease-in-out duration-200 rounded-lg py-2 px-3 bg-accent2Light dark:bg-accent2Dark" />
                </fieldset>
                <fieldset className="flex flex-col gap-1">
                    <label htmlFor="region" className="text-sm opacity-75">
                        Region
                    </label>
                    <select
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="transition ease-in-out duration-200 rounded-lg py-2 px-3 bg-accent2Light dark:bg-accent2Dark min-h-[40px]">
                        {regions.map(({code, location}) => (
                            <option value={code} key={code}>{location} - {code}</option>
                        ))}
                    </select>
                </fieldset>
                <fieldset className="flex flex-col gap-1">
                    <label htmlFor="version" className="text-sm opacity-75">
                        Version
                    </label>
                    <select
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className="transition ease-in-out duration-200 rounded-lg py-2 px-3 bg-accent2Light dark:bg-accent2Dark min-h-[40px]">
                        <option value="latest">Latest</option>
                        <option value="canary">Canary</option>
                    </select>
                </fieldset>
                <fieldset className="flex items-center gap-2">
                    <input id="instance" type="checkbox" checked={createInstance} onChange={(e) => setCreateInstance(e.target.checked)} />
                    <label htmlFor="instance" className="text-sm opacity-75">
                        Create instance?
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
                        const res = await createDatabase({ name, region: region as Region, image: version as "latest" | "canary", instance: createInstance });
                        setIsLoading(false);
                        if (res === undefined) return router.back();
                        window.alert(res);
                    }}
                    disabled={name.trim().length === 0 || isLoading}>
                    {isLoading ? "Creating..." : "Create"}
                </Button>
            </Modal.Actions>
        </Modal.Root>
    );
}