import { ConnectionUrl } from "@/app/components/ConnectionUrl";
import { Hostname } from "@/app/components/Hostname";
import { Turso, TursoError } from "@/turso";
import { TrashIcon } from "@heroicons/react/24/solid";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page({params}: {params: {dbName: string, instanceName: string}}) {
    const token = cookies().get("token");
    if (!token) redirect("/token");
    const turso = new Turso(token.value);
    const instance = await turso.getDatabaseInstance(params.dbName, params.instanceName);

    if (instance === TursoError.AUTHENTICATION_REQUIRED) {
        redirect("/token");
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
            <div className="flex flex-col gap-2 border border-borderLight dark:border-borderDark bg-accentLight dark:bg-accentDark shadow-sm mb-4 px-4 pt-3 pb-4 rounded-xl">
                <div>
                    <div className="opacity-75 text-sm -mb-1">
                        Type
                    </div>
                    <div className="text-2xl font-bold capitalize">
                        {instance.type}
                    </div>
                </div>
                <div>
                    <div className="opacity-75 text-sm -mb-1">
                        Region
                    </div>
                    <div className="text-2xl font-bold">
                        {instance.region}
                    </div>
                </div>
                <Hostname hostname={instance.hostname} />
                <ConnectionUrl hostname={instance.hostname} />
            </div>
        </>
    );
}