import { TursoError } from "@/turso";
import { Turso } from "@/turso";
import { ChevronRightIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default async function Page() {
    const turso = new Turso(process.env.NEXT_PUBLIC_TURSO_TOKEN!);
    const databases = await turso.listDatabases();

    if (databases === TursoError.AUTHENTICATION_REQUIRED) {
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

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold">
                    Databases
                </div>
                <Link href="/create" className="h-8 w-8 text-blue-600 hover:text-blue-500 active:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 dark:active:text-blue-600 transition ease-in-out duration-200">
                    <PlusCircleIcon />
                </Link>
            </div>
            <div className="flex flex-col gap-4">
                {databases.map((database) => (
                    <Link key={database.Name} href={`/database/${database.Name}`} className="group transition ease-in-out duration-200 py-2 px-3 border border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600 rounded-lg flex items-center justify-between">
                        <div>
                            <div className={"text-xl font-medium"}>
                                {database.Name}
                            </div>
                            <div className={"opacity-75"}>
                                {database.regions?.length ?? 0} instances
                            </div>
                        </div>
                        <ChevronRightIcon className={"h-6 w-6 text-neutral-300 group-hover:text-neutral-400 dark:text-neutral-700 dark:group-hover:text-neutral-600 transition ease-in-out duration-200"} />
                    </Link>
                ))}
            </div>
        </>
    );
}