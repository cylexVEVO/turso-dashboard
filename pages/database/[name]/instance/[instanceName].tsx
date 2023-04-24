import { useMutation, useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { TursoError } from '@/turso';
import { queryClient } from '@/pages/_app';
import { ConnectionUrl } from '@/components/ConnectionUrl';
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from 'react';
import { Spinner } from '@/components/Spinner';

const inter = Inter({ subsets: ['latin'] })

const DestroyInstanceModal = (props: {database: string, instance: string}) => {
  const router = useRouter();
  const {mutate, isLoading} = useMutation({
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

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={"bg-black/75 fixed inset-0 data-[state=open]:animate-fadeIn"}/>
      <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
        <Dialog.Title className={"text-3xl font-bold mb-4"}>
          Destroy Instance
        </Dialog.Title>
        <Dialog.Description>
          Are you sure you want to destroy the instance? This will only destroy this instance and no data will be deleted.
        </Dialog.Description>
        <div className={"flex justify-end mt-4"}>
          <button
            onClick={() => mutate({database: props.database, instance: props.instance})}
            className={"px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}
            disabled={isLoading}>
            {isLoading ? "Destroying..." : "Destroy"}
          </button>
        </div>
        <Dialog.Close asChild>
          <XMarkIcon className={"h-6 w-6 text-neutral-300 hover:text-neutral-400 transition ease-in-out duration-200 absolute top-4 right-4"}/>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

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

  if (isLoading || instanceLoading) return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"text-3xl font-bold mb-4"}>
        <a href={".."}>Databases</a> /
      </div>
      <Spinner />
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
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <TrashIcon className={"h-6 w-6 text-neutral-400 hover:text-red-600 active:text-red-700 transition ease-in-out duration-200"} />
          </Dialog.Trigger>
          <DestroyInstanceModal database={data.Name} instance={instance.name}/>
        </Dialog.Root>
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