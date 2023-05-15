import { TursoError } from "@/turso";
import { Turso } from "@/turso";
import { ChevronRightIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PlusIcon } from "@heroicons/react/20/solid";
import { Button } from "./components/Button";

export default async function Page() {
    const token = cookies().get("token");
    if (!token) redirect("/token");
    const turso = new Turso(token.value);
    const databases = await turso.listDatabases();

    if (databases === TursoError.AUTHENTICATION_REQUIRED) {
        redirect("/token");
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-bold">
                    Databases
                </div>
                <Button href="/create" size="small">
                    <PlusIcon className="w-5 h-5" />
                    Create
                </Button>
            </div>
            <div className="flex flex-col rounded-xl divide-y divide-borderLight dark:divide-borderDark border border-borderLight dark:border-borderDark bg-accentLight dark:bg-accentDark shadow-sm mb-4">
                {databases.map((database) => (
                    <Link key={database.Name} href={`/database/${database.Name}`} className="group transition ease-in-out duration-200 px-4 py-2.5 flex items-center justify-between">
                        <div>
                            <div className="text-xl font-semibold">
                                {database.Name}
                            </div>
                            <div className="opacity-75">
                                {database.regions?.length ?? 0} instances
                            </div>
                        </div>
                        <ChevronRightIcon className="h-6 w-6 text-neutral-300 group-hover:text-neutral-400 dark:text-neutral-700 dark:group-hover:text-neutral-500 transition ease-in-out duration-200" />
                    </Link>
                ))}
            </div>
        </>
    );
}