import { ConnectionUrl } from "@/app/components/ConnectionUrl";
import { Turso, TursoError } from "@/turso";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Actions } from "./Actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Shell } from "./Shell";
import { Hostname } from "@/app/components/Hostname";

export default async function Page({params}: {params: {dbName: string}}) {
    const token = cookies().get("token");
    if (!token) redirect("/token");
    const turso = new Turso(token.value);
    const databaseP = turso.getDatabase(params.dbName);
    const instancesP = turso.listDatabaseInstances(params.dbName);

    const [database, instances] = await Promise.all([databaseP, instancesP]);
    
    if (database === TursoError.AUTHENTICATION_REQUIRED || instances === TursoError.AUTHENTICATION_REQUIRED) {
        redirect("/token");
    }

    if (!database || !instances) {
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
                    <Link href="/">Databases</Link> / {params.dbName}
                </div>
                <Actions dbName={params.dbName}/>
            </div>
            <div className="text-xl font-medium mb-2">
                {instances.length === 0 ? "No" : instances.length} instances
            </div>
            {instances.length > 0 &&
                <div className="flex flex-col rounded-xl divide-y divide-borderLight dark:divide-borderDark border border-borderLight dark:border-borderDark bg-accentLight dark:bg-accentDark shadow-sm mb-4">
                    {instances.map((instance) => {
                        return (
                            <Link key={instance.name} href={`/database/${params.dbName}/instance/${instance.name}`} className="group transition ease-in-out duration-200 px-4 py-2.5 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xl font-semibold">
                                            {instance.name}
                                        </div>
                                        <div className={`text-sm text-white font-medium rounded-md py-0.5 px-2 capitalize ${instance.type === "primary" ? "bg-green-400 dark:bg-green-500" : "bg-blue-400 dark:bg-blue-500"}`}>
                                            {instance.type}
                                        </div>
                                    </div>
                                    <div className={"opacity-75"}>
                                        Region: {instance.region}
                                    </div>
                                </div>
                                <ChevronRightIcon className="h-6 w-6 text-neutral-300 group-hover:text-neutral-400 dark:text-neutral-700 dark:group-hover:text-neutral-500 transition ease-in-out duration-200" />
                            </Link>
                        )
                    })}
                </div>
            }
            <div className="text-xl font-medium mb-2">
                Information
            </div>
            <div className="flex flex-col gap-2 border border-borderLight dark:border-borderDark bg-accentLight dark:bg-accentDark shadow-sm mb-4 px-4 pt-3 pb-4 rounded-xl">
                <div>
                    <div className="opacity-75 text-sm -mb-1">
                        Primary Region
                    </div>
                    <div className="text-2xl font-bold">
                        {database.primaryRegion ?? "None"}
                    </div>
                </div>
                <Hostname hostname={database.Hostname} />
                <ConnectionUrl hostname={database.Hostname} />
            </div>
            <div className={"text-xl font-medium mb-1"}>
                Shell
            </div>
            <Shell hostname={database.Hostname} dbName={database.Name} />
        </>
    );
}