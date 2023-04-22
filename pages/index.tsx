import { useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import {ChevronRightIcon} from "@heroicons/react/24/solid";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const {isLoading, error, data} = useQuery({
    queryKey: ["databaseList"],
    queryFn: async () => {
      return await globalThis.turso.listDatabases(); 
    }
  });

  if (error) return "Error.";

  return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"text-3xl font-bold mb-4"}>
        Databases
      </div>
      <div className={"flex flex-col gap-4"}>
        {isLoading &&
          <img src="/spinner.svg" width={32} height={32} className={"animate-spin"}/>
        }
        {!isLoading && data && data.map((database) => {
          return (
            <a key={database.Name} href={`/database/${database.Name}`} className={"group transition ease-in-out duration-200 py-2 px-3 border border-neutral-300 hover:border-neutral-400 rounded-lg flex items-center justify-between"}>
              <div>
                <div className={"text-xl font-medium"}>
                  {database.Name}
                </div>
                <div className={"opacity-75"}>
                  {database.regions.length} instances
                </div>
              </div>
              <ChevronRightIcon className={"h-6 w-6 text-neutral-300 group-hover:text-neutral-400 transition ease-in-out duration-200"}/>
            </a>
          );
        })}
      </div>
    </main>
  )
}
