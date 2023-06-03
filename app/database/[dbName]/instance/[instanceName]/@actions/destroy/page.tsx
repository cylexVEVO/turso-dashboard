"use client";

import { destroyInstance } from "@/app/_actions";
import { Button } from "@/app/components/Button";
import { Modal } from "@/app/components/Modal";
import { Region } from "@/turso";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const regions: string[] = [];

for (const enumKey in Region) {
    // take only strings (the region names)
    if (Number.isNaN(Number(enumKey))) regions.push(enumKey);
}

export default function Page() {
    const params = useParams() as { dbName: string, instanceName: string };
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (params === null) return null;

    return (
        <Modal.Root>
            <Modal.Title>
                Destroy Instance
            </Modal.Title>
            <Modal.Description>
                Are you sure you want to destroy this instance? Only this instance will be destroyed and no data will be deleted.
            </Modal.Description>
            <Modal.Actions>
                <Button
                    onClick={async () => {
                        setIsLoading(true);
                        const res = await destroyInstance({ database: params.dbName, instance: params.instanceName });
                        setIsLoading(false);
                        if (res === undefined) return router.push(`/database/${params.dbName}`);
                        window.alert(res);
                    }}
                    color="red"
                    disabled={isLoading}>
                    {isLoading ? "Destroying..." : "Destroy"}
                </Button>
            </Modal.Actions>
        </Modal.Root>
    );
}