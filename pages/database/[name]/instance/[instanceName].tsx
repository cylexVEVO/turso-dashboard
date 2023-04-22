import { useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    const router = useRouter();
    const { isLoading, error, data } = useQuery({
      queryKey: ["database", router.query.name],
      queryFn: async () => {
        if (router.query.name === undefined || router.query.instanceName === undefined) return false;
        return await globalThis.turso.getDatabase(router.query.name as string);
      }
  });

  const { isLoading: instanceLoading, error: instanceError, data: instance } = useQuery({
    queryKey: ["database_instance", router.query.name, router.query.instanceName, !!data],
    queryFn: async () => {
      if (router.query.name === undefined || router.query.instanceName === undefined || !data) return false;
      return await globalThis.turso.getDatabaseInstance(data.Name, router.query.instanceName as string);
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
      <div className={"text-3xl font-bold mb-4"}>
        <a href={"../../.."}>Databases</a> / <a href={".."}>{data.Name}</a> / {instance.name}
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
    </main>
  )
}