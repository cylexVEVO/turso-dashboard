import { useMutation, useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router';
import { ChevronRightIcon, EllipsisHorizontalCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useContext, useState } from 'react';
import { queryClient } from '@/pages/_app';
import { CreateDatabaseInstanceArgs, Region, TursoError } from '@/turso';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from "@radix-ui/react-dialog";

const inter = Inter({ subsets: ['latin'] })

const regions: string[] = [];

for (const enumKey in Region) {
  // take only strings (the region names)
  if (Number.isNaN(Number(enumKey))) regions.push(enumKey);
}

const CreateInstanceModal = (props: {hide: () => void, dbName: string}) => {
  const {mutate, isLoading} = useMutation({
    mutationFn: async (args: CreateDatabaseInstanceArgs) => {
      return await globalThis.turso.createDatabaseInstance(args);
    },
    onError: (e) => {
      window.alert(e);
    },
    onSuccess: (instance) => {
      if (instance === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      if (instance === TursoError.DATABASE_LIMIT) return window.alert("you've hit the db limit");
      queryClient.invalidateQueries();
      setRegion("lax");
      setVersion("latest");
      props.hide();
    }
  });

  const [region, setRegion] = useState("lax");
  const [version, setVersion] = useState("latest");

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={"bg-black/75 fixed inset-0 data-[state=open]:animate-fadeIn"}/>
      <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
        <Dialog.Title className={"text-3xl font-bold mb-4"}>
          New Instance
        </Dialog.Title>
        <div className={"flex flex-col gap-2 mb-4"}>
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
        </div>
        <div className={"flex justify-end"}>
          <button
            onClick={() => mutate({ dbName: props.dbName, region, image: version } as CreateDatabaseInstanceArgs)}
            className={"px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}
            disabled={isLoading}>
            {isLoading ? "Loading..." : "Create"}
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
      if (router.query.name === undefined) return false;
      const database = await globalThis.turso.getDatabase(router.query.name as string);
      if (database === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      return database;
    }
  });

  const {isLoading: instancesLoading, error: instancesError, data: instances} = useQuery({
      queryKey: ["database_instances", router.query.name, !!data],
      queryFn: async () => {
        if (router.query.name === undefined || !data) return false;
        const instances = await globalThis.turso.listDatabaseInstances(data.Name);
        if (instances === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
        return instances;
      }
  });

  const {mutate} = useMutation({
    mutationFn: async (name: string) => {
      return await globalThis.turso.deleteDatabase(name);
    },
    onError: (e) => {
      window.alert(e);
    },
    onSuccess: (r) => {
      if (r === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      if (r === TursoError.NOT_FOUND) return window.alert("database not found");
      queryClient.invalidateQueries();
      router.replace("/");
    }
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
      <div className={"flex items-center justify-between mb-4"}>
        <div className={"text-3xl font-bold"}>
          <a href={".."}>Databases</a> / {data.Name}
        </div>
        <Dialog.Root open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <EllipsisHorizontalCircleIcon className={"h-8 w-8 text-blue-600 hover:text-blue-500 active:text-blue-700 transition ease-in-out duration-200"} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className={"data-[state=open]:animate-fadeIn p-2 rounded-lg bg-white shadow-lg border border-neutral-200 flex flex-col"}
                sideOffset={4}
                side={"bottom"}
                align={"end"}>
                <DropdownMenu.Item asChild>
                  <Dialog.Trigger asChild>
                    <button onClick={() => setDropdownOpen(false)} className={"py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-neutral-200 outline-none text-left"}>
                      New instance
                    </button>
                  </Dialog.Trigger>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => mutate(data.Name)}
                    className={"py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-red-600 hover:text-white text-red-600 outline-none text-left"}>
                    Destroy database
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <CreateInstanceModal hide={() => setCreateDialogOpen(false)} dbName={data.Name} />
        </Dialog.Root>
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