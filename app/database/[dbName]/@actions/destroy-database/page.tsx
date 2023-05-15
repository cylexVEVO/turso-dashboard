"use client";

import { destroyDatabase } from "@/app/_actions";
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
    const params = useParams() as { dbName: string };
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (params === null) return null;

    return (
        <Modal.Root>
            <Modal.Title>
                Destroy Database
            </Modal.Title>
            <Modal.Description>
                Are you sure you want to destroy the database? This will destroy all instances and delete all data.
            </Modal.Description>
            <Modal.Actions>
                <Button
                    onClick={async () => {
                        setIsLoading(true);
                        const res = await destroyDatabase({ database: params.dbName });
                        setIsLoading(false);
                        if (res === undefined) return router.push("/");
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