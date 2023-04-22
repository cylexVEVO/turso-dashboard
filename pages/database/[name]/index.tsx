import { useMutation, useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router';
import { ChevronRightIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useContext } from 'react';
import { queryClient } from '@/pages/_app';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter();
  const { isLoading, error, data } = useQuery({
    queryKey: ["database", router.query.name],
    queryFn: async () => {
      if (router.query.name === undefined) return false;
      return await globalThis.turso.getDatabase(router.query.name as string);
    }
  });

  const {isLoading: instancesLoading, error: instancesError, data: instances} = useQuery({
      queryKey: ["database_instances", router.query.name, !!data],
      queryFn: async () => {
        if (router.query.name === undefined || !data) return false;
        return await globalThis.turso.listDatabaseInstances(data.Name);
      }
  });

  const {mutate} = useMutation({
    mutationFn: async (name: string) => {
      return await globalThis.turso.deleteDatabase(name);
    },
    onError: (e) => {
      window.alert(e);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      router.replace("/");
    }
  });

  if (isLoading || instancesLoading) return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"text-3xl font-bold mb-4"}>
        <a href={".."}>Databases</a> / <img src="/spinner.svg" width={32} height={32} className={"animate-spin mt-4"}/>
      </div>
    </main>
  );
  
  if (!data || !instances) return "Database not found.";
  if (error || instancesError) return "Error.";

  return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"flex items-center justify-between"}>
        <div className={"text-3xl font-bold mb-4"}>
          <a href={".."}>Databases</a> / {data.Name}
        </div>
        <button onClick={() => mutate(data.Name)}>
          <TrashIcon className={"h-6 w-6 text-neutral-400 hover:text-red-600 active:text-red-700 transition ease-in-out duration-200"}/>
        </button>
      </div>
      <div className={"text-xl font-medium mb-2"}>
        {data.regions?.length ?? 0} instances
      </div>
      <div className={"flex flex-col gap-4 mb-4"}>
        {instances.map((instance) => {
          return (
            <a key={instance.name} href={`/database/${data.Name}/instance/${instance.name}`} className={"group transition ease-in-out duration-200 py-2 px-3 border border-neutral-300 hover:border-neutral-400 rounded-lg flex items-center justify-between"}>
              <div>
                <div className={"flex items-center gap-3"}>
                  <div className={"text-xl font-medium"}>
                    {instance.name}
                  </div>
                  <div className={`text-sm text-white font-medium rounded-md py-0.5 px-2 ${instance.type === "primary" ? "bg-green-400" : "bg-blue-400"}`}>
                    {instance.type}
                  </div>
                </div>
                <div className={"opacity-75"}>
                  Region: {instance.region}
                </div>
              </div>
              <ChevronRightIcon className={"h-6 w-6 text-neutral-300 group-hover:text-neutral-400 transition ease-in-out duration-200"}/>
            </a>
          );
        })}
      </div>
      <div className={"text-xl font-medium"}>
        Primary Region
      </div>
      <div className={"opacity-75 mb-2"}>
        {data.primaryRegion}
      </div>
      <div className={"text-xl font-medium"}>
        Hostname
      </div>
      <div className={"opacity-75 mb-2"}>
        {data.Hostname}
      </div>
    </main>
  )
}