import { useMutation, useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router';
import { TrashIcon } from '@heroicons/react/24/solid';
import { TursoError } from '@/turso';
import { queryClient } from '@/pages/_app';
import { ConnectionUrl } from '@/components/ConnectionUrl';

// TODO: add instance deletions

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const router = useRouter();
    const { isLoading, error, data } = useQuery({
      queryKey: ["database", router.query.name],
      queryFn: async () => {
        if (router.query.name === undefined || router.query.instanceName === undefined) return false;
        const database = await globalThis.turso.getDatabase(router.query.name as string);
        if (database === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
        return database;
      }
  });

  const { isLoading: instanceLoading, error: instanceError, data: instance } = useQuery({
    queryKey: ["database_instance", router.query.name, router.query.instanceName, !!data],
    queryFn: async () => {
      if (router.query.name === undefined || router.query.instanceName === undefined || !data) return false;
      const instance = await globalThis.turso.getDatabaseInstance(data.Name, router.query.instanceName as string);
      if (instance === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      return instance;
    }
  });

  const {mutate} = useMutation({
    mutationFn: async ({database, instance}: {database: string, instance: string}) => {
      return await globalThis.turso.deleteDatabaseInstance(database, instance);
    },
    onError: (e) => {
      window.alert(e);
    },
    onSuccess: (r) => {
      if (r === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      if (r === TursoError.BAD_REQUEST) return window.alert("you cannot delete the primary instance. please delete the entire database instead.");
      if (r === TursoError.NOT_FOUND) return window.alert("instance not found");
      queryClient.invalidateQueries();
      router.replace(`/database/${router.query.name}`);
    }
  });

  if (isLoading || instanceLoading) return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"text-3xl font-bold mb-4"}>
        <a href={".."}>Databases</a> / <img src="/spinner.svg" width={32} height={32} className={"animate-spin mt-4"}/>
      </div>
    </main>
  );

  if (!data || !instance) return "Database not found.";
  if (error || instanceError) return "Error.";
  
  return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"flex items-center justify-between mb-4"}>
        <div className={"text-3xl font-bold"}>
          <a href={"../../.."}>Databases</a> / <a href={".."}>{data.Name}</a> / {instance.name}
        </div>
        <button onClick={() => mutate({database: data.Name, instance: instance.name})}>
          <TrashIcon className={"h-6 w-6 text-neutral-400 hover:text-red-600 active:text-red-700 transition ease-in-out duration-200"}/>
        </button>
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
      <ConnectionUrl hostname={instance.hostname}/>
    </main>
  )
};