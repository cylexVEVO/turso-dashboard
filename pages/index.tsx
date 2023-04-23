import { useMutation, useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import {ChevronRightIcon, PlusCircleIcon, XMarkIcon} from "@heroicons/react/24/solid";
import { type CreateDatabaseArgs, TursoError, Region } from '@/turso';
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from 'react';
import { queryClient } from './_app';

const inter = Inter({ subsets: ['latin'] })

const regions: string[] = [];

for (const enumKey in Region) {
  // take only strings (the region names)
  if (Number.isNaN(Number(enumKey))) regions.push(enumKey);
}

const CreateDatabaseModal = (props: {hide: () => void}) => {
  const {mutate, isLoading} = useMutation({
    mutationFn: async (args: CreateDatabaseArgs & {createInstance: boolean}) => {
      const database = await globalThis.turso.createDatabase(args);
      if (database === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      if (database === TursoError.DATABASE_LIMIT) return window.alert("you've hit the db limit");
      if (!args.createInstance) return {database};
      const instance = await globalThis.turso.createDatabaseInstance({dbName: database.database.Name, ...args});
      if (instance === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      if (instance === TursoError.DATABASE_LIMIT) return window.alert("you've hit the db limit");
      return {
        database,
        instance
      };
    },
    onError: (e) => {
      window.alert(e);
    },
    onSuccess: (database) => {
      if (!database) return;
      queryClient.invalidateQueries();
      setName("");
      setRegion("lax");
      setVersion("latest");
      props.hide();
    }
  });

  const [name, setName] = useState("");
  const [region, setRegion] = useState("lax");
  const [version, setVersion] = useState("latest");
  const [createInstance, setCreateInstance] = useState(true);

  const canCreate = name.length > 0 && !isLoading;

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={"bg-black/75 fixed inset-0 data-[state=open]:animate-fadeIn"}/>
      <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
        <Dialog.Title className={"text-3xl font-bold mb-4"}>
          New Database
        </Dialog.Title>
        <div className={"flex flex-col gap-2 mb-4"}>
          <fieldset className={"flex flex-col gap-1"}>
            <label htmlFor={"name"} className={"text-sm opacity-75"}>
              Name
            </label>
            <input
              id={"name"}
              placeholder={"Database Name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400"} />
          </fieldset>
          <fieldset className={"flex flex-col gap-1"}>
            <label htmlFor={"region"} className={"text-sm opacity-75"}>
              Region
            </label>
            <select
              id={"region"}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400 bg-transparent"}>
              {regions.map((region) => (
                <option value={region} key={region}>{region}</option>
              ))}
            </select>
          </fieldset>
          <fieldset className={"flex flex-col gap-1"}>
            <label htmlFor={"version"} className={"text-sm opacity-75"}>
              Version
            </label>
            <select
              id={"version"}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400 bg-transparent"}>
              <option value={"latest"}>Latest</option>
              <option value={"canary"}>Canary</option>
            </select>
          </fieldset>
          <fieldset className={"flex items-center gap-2"}>
            <input id={"instance"} type={"checkbox"} checked={createInstance} onChange={(e) => setCreateInstance(e.target.checked)}/>
            <label htmlFor={"instance"} className={"text-sm opacity-75"}>
              Create instance?
            </label>
          </fieldset>
        </div>
        <div className={"flex justify-end"}>
          <button
            onClick={() => mutate({ name, region, image: version, createInstance } as CreateDatabaseArgs & {createInstance: boolean})}
            className={"px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}
            disabled={!canCreate}>
            {isLoading ? "Creating..." : "Create"}
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
  const {isLoading, error, data} = useQuery({
    queryKey: ["databaseList"],
    queryFn: async () => {
      const databases = await globalThis.turso.listDatabases();
      if (databases === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      return databases;
    }
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (error) return "Error.";

  return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"flex items-center justify-between mb-4"}>
        <div className={"text-3xl font-bold"}>
          Databases
        </div>
        <Dialog.Root open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <Dialog.Trigger asChild>
            <PlusCircleIcon className={"h-8 w-8 text-blue-600 hover:text-blue-500 active:text-blue-700 transition ease-in-out duration-200"} />
          </Dialog.Trigger>
          <CreateDatabaseModal hide={() => setCreateDialogOpen(false)}/>
        </Dialog.Root>
      </div>
      <div className={"flex flex-col gap-4"}>
        {isLoading &&
          <img src="/spinner.svg" width={32} height={32} className={"animate-spin"}/>
        }
        {!isLoading && typeof data === "object" && data.map((database) => {
          return (
            <a key={database.Name} href={`/database/${database.Name}`} className={"group transition ease-in-out duration-200 py-2 px-3 border border-neutral-300 hover:border-neutral-400 rounded-lg flex items-center justify-between"}>
              <div>
                <div className={"text-xl font-medium"}>
                  {database.Name}
                </div>
                <div className={"opacity-75"}>
                  {database.regions?.length ?? 0} instances
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
