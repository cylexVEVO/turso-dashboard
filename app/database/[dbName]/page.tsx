import { ConnectionUrl } from "@/components/ConnectionUrl";
import { Turso, TursoError } from "@/turso";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Actions } from "./Actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Shell } from "./Shell";

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
                <div className="flex flex-col gap-4 mb-4">
                    {instances.map((instance) => {
                        return (
                            <Link key={instance.name} href={`/database/${params.dbName}/instance/${instance.name}`} className="group transition ease-in-out duration-200 py-2 px-3 border border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600 rounded-lg flex items-center justify-between">
                                <div>
                                    <div className={"flex items-center gap-3"}>
                                        <div className={"text-xl font-medium"}>
                                            {instance.name}
                                        </div>
                                        <div className={`text-sm text-white font-medium rounded-md py-0.5 px-2 ${instance.type === "primary" ? "bg-green-400 dark:bg-green-500" : "bg-blue-400 dark:bg-blue-500"}`}>
                                            {instance.type}
                                        </div>
                                    </div>
                                    <div className={"opacity-75"}>
                                        Region: {instance.region}
                                    </div>
                                </div>
                                <ChevronRightIcon className={"h-6 w-6 text-neutral-300 group-hover:text-neutral-400 dark:text-neutral-700 dark:group-hover:text-neutral-600 transition ease-in-out duration-200"} />
                            </Link>
                        )
                    })}
                </div>
            }
            <div className={"text-xl font-medium"}>
                Primary Region
            </div>
            <div className={"opacity-75 mb-2"}>
                {database.primaryRegion ?? "None"}
            </div>
            <div className={"text-xl font-medium"}>
                Hostname
            </div>
            <div className={"opacity-75 mb-2"}>
                {database.Hostname}
            </div>
            <ConnectionUrl hostname={database.Hostname} />
            <div className={"text-xl font-medium mb-1"}>
                Shell
            </div>
            <Shell hostname={database.Hostname}/>
        </>
    );
}