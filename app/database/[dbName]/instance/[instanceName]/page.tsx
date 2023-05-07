import { ConnectionUrl } from "@/components/ConnectionUrl";
import { Turso, TursoError } from "@/turso";
import { TrashIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default async function Page({params}: {params: {dbName: string, instanceName: string}}) {
    const turso = new Turso(process.env.NEXT_PUBLIC_TURSO_TOKEN!);
    const instance = await turso.getDatabaseInstance(params.dbName, params.instanceName);

    if (instance === TursoError.AUTHENTICATION_REQUIRED) {
        return (
            <div>
                <div className="text-3xl font-bold mb-2">
                    Error: Authentication required
                </div>
                <div>
                    Please make sure your Turso token is set correctly.
                </div>
            </div>
        );
    }

    if (!instance) {
        return (
            <div>
                <div className="text-3xl font-bold mb-2">
                    Database not found
                </div>
                <div>
                    That database wasn&apos;t found.
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold">
                    <Link href="/">Databases</Link> / <Link href={`/database/${params.dbName}`}>{params.dbName}</Link> / {params.instanceName}
                </div>
                <Link href={`/database/${params.dbName}/instance/${params.instanceName}/destroy`} className="h-6 w-6 text-neutral-400 hover:text-red-600 active:text-red-700 transition ease-in-out duration-200">
                    <TrashIcon />
                </Link>
            </div>
            <div className={"text-xl font-medium"}>
                Type
            </div>
            <div className={"opacity-75 mb-2"}>
                {instance.type}
            </div>
            <div className={"text-xl font-medium"}>
                Region
            </div>
            <div className={"opacity-75 mb-2"}>
                {instance.region}
            </div>
            <div className={"text-xl font-medium"}>
                Hostname
            </div>
            <div className={"opacity-75 mb-2"}>
                {instance.hostname}
            </div>
            <ConnectionUrl hostname={instance.hostname} />
        </>
    );
}