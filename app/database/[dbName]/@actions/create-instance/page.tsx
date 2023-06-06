"use client";

import { createInstance } from "@/app/_actions";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { Region, regions } from "@/turso";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
    const params = useParams() as { dbName: string };
    const router = useRouter();
    const [region, setRegion] = useState("lax");
    const [version, setVersion] = useState("latest");
    const [isLoading, setIsLoading] = useState(false);

    if (params === null) return null;

    return (
        <Modal.Root>
            <Modal.Title>
                Create Instance
            </Modal.Title>
            <Modal.Fields>
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
            </Modal.Fields>
            <Modal.Actions>
                <Button onClick={() => router.back()} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={async () => {
                        setIsLoading(true);
                        const res = await createInstance({ dbName: params.dbName, region: region as Region, image: version as "latest" | "canary" });
                        setIsLoading(false);
                        if (res === undefined) {
                            router.refresh();
                            return router.back()
                        };
                        window.alert(res);
                    }}
                    disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create"}
                </Button>
            </Modal.Actions>
        </Modal.Root>
    );
}