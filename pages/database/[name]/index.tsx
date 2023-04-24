import { useMutation, useQuery } from '@tanstack/react-query'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router';
import { ChevronRightIcon, EllipsisHorizontalCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { queryClient } from '@/pages/_app';
import { CreateDatabaseInstanceArgs, Region, TursoError } from '@/turso';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from "@radix-ui/react-dialog";
import { ConnectionUrl } from '@/components/ConnectionUrl';
import { Spinner } from '@/components/Spinner';

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
      <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
        <Dialog.Title className={"text-3xl font-bold mb-4"}>
          Create Instance
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
              className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-600 bg-transparent"}>
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
              className={"transition ease-in-out duration-200 rounded-lg border py-2 px-3 border-neutral-300 focus:border-neutral-400 dark:border-neutral-700 dark:focus:border-neutral-600 bg-transparent"}>
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

const DestroyDatabaseModal = (props: {dbName: string}) => {
  const router = useRouter();
  const {mutate, isLoading} = useMutation({
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

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={"bg-black/75 fixed inset-0 data-[state=open]:animate-fadeIn"}/>
      <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
        <Dialog.Title className={"text-3xl font-bold mb-4"}>
          Destroy Database
        </Dialog.Title>
        <Dialog.Description>
          Are you sure you want to destroy the database? This will destroy all instances and delete all data.
        </Dialog.Description>
        <div className={"flex justify-end mt-4"}>
          <button
            onClick={() => mutate(props.dbName)}
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

const CreateTokenModal = (props: {hide: () => void, dbName: string}) => {
  const {mutate, isLoading} = useMutation({
    mutationFn: async ({database, expiration, readOnly}: {database: string, expiration: string, readOnly: boolean}) => {
      const token = await globalThis.turso.createToken(database, expiration as "default" | "none", readOnly);
      return token;
    },
    onError: (e) => {
      window.alert(e);
    },
    onSuccess: (token) => {
      if (token === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      if (token === TursoError.NOT_FOUND) return window.alert("database not found");
      setToken(token.jwt);
    }
  });

  const [expires, setExpires] = useState(true);
  const [readOnly, setReadOnly] = useState(true);
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 4000);
  };

  if (token) {
    return (
      <Dialog.Portal>
        <Dialog.Overlay className={"bg-black/75 fixed inset-0 data-[state=open]:animate-fadeIn"} />
        <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
          <Dialog.Title className={"text-3xl font-bold mb-4"}>
            Create Token
          </Dialog.Title>
          <Dialog.Description>
            Your token is:
            <div className={"flex mt-2"}>
              <div className={"border-l border-y border-neutral-300 dark:border-neutral-700 py-2 px-3 font-mono rounded-l-lg overflow-auto whitespace-nowrap"}>
                {token}
              </div>
              <button
                className={`border border-neutral-300 dark:border-neutral-700 py-2 px-4 rounded-r-lg ${copied ? "text-green-700 dark:text-green-500" : ""}`}
                onClick={copy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </Dialog.Description>
          <div className={"flex justify-end mt-4"}>
            <button onClick={() => {
              setExpires(true);
              setReadOnly(true);
              setToken("");
              props.hide();
            }} className={"px-4 py-2 rounded-lg text-white bg-neutral-500 hover:bg-neutral-400 active:bg-neutral-600 dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:active:bg-neutral-700 transition ease-in-out duration-200"}>
              Close
            </button>
          </div>
          <Dialog.Close asChild>
            <XMarkIcon className={"h-6 w-6 text-neutral-300 hover:text-neutral-400 transition ease-in-out duration-200 absolute top-4 right-4"} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    );
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={"bg-black/75 fixed inset-0 data-[state=open]:animate-fadeIn"} />
      <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
        <Dialog.Title className={"text-3xl font-bold mb-4"}>
          Create Token
        </Dialog.Title>
        <div className={"flex flex-col gap-2 mb-4"}>
          <fieldset className={"flex items-center gap-2"}>
            <input id={"expires"} type={"checkbox"} checked={expires} onChange={(e) => setExpires(e.target.checked)} />
            <label htmlFor={"expires"} className={"text-sm opacity-75"}>
              Expires?
            </label>
          </fieldset>
          <fieldset className={"flex items-center gap-2"}>
            <input id={"readonly"} type={"checkbox"} checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
            <label htmlFor={"readonly"} className={"text-sm opacity-75"}>
              Read only?
            </label>
          </fieldset>
        </div>
        <div className={"flex justify-end"}>
          <button
            onClick={() => mutate({database: props.dbName, expiration: expires ? "default" : "none", readOnly})}
            className={"px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}
            disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
        <Dialog.Close asChild>
          <XMarkIcon className={"h-6 w-6 text-neutral-300 hover:text-neutral-400 transition ease-in-out duration-200 absolute top-4 right-4"} />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

const RotateTokensModal = (props: {hide: () => void, dbName: string}) => {
  const {mutate, isLoading} = useMutation({
    mutationFn: async (name: string) => {
      return await globalThis.turso.rotateTokens(name);
    },
    onError: (e) => {
      window.alert(e);
    },
    onSuccess: (r) => {
      if (r === TursoError.AUTHENTICATED_REQUIRED) return window.alert("authorization required");
      if (r === TursoError.NOT_FOUND) return window.alert("database not found");
      props.hide();
    }
  });

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={"bg-black/75 fixed inset-0 data-[state=open]:animate-fadeIn"}/>
      <Dialog.Content className={"data-[state=open]:animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 bg-white dark:bg-neutral-900 shadow-md max-h-[85vh] w-[90vw] max-w-2xl rounded-lg"}>
        <Dialog.Title className={"text-3xl font-bold mb-4"}>
          Rotate Tokens
        </Dialog.Title>
        <Dialog.Description>
          Are you sure you want to rotate the tokens? All instances will be restarted, and all active connections will be dropped.
        </Dialog.Description>
        <div className={"flex justify-end mt-4"}>
          <button
            onClick={() => mutate(props.dbName)}
            className={"px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition ease-in-out duration-200 disabled:opacity-50 disabled:pointer-events-none"}
            disabled={isLoading}>
            {isLoading ? "Rotating..." : "Rotate"}
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

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);
  const [createTokenDialogOpen, setCreateTokenDialogOpen] = useState(false);
  const [rotateTokensDialogOpen, setRotateTokensDialogOpen] = useState(false);

  if (isLoading || instancesLoading) return (
    <main className={`container mx-auto py-8 ${inter.className}`}>
      <div className={"text-3xl font-bold mb-4"}>
        <a href={".."}>Databases</a> /
      </div>
      <Spinner />
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
        <DropdownMenu.Root open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenu.Trigger asChild>
            <EllipsisHorizontalCircleIcon className={"h-8 w-8 text-blue-600 hover:text-blue-500 active:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 dark:active:text-blue-600 transition ease-in-out duration-200"} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={"data-[state=open]:animate-fadeIn p-2 rounded-lg bg-white shadow-lg border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 flex flex-col"}
              sideOffset={4}
              side={"bottom"}
              align={"end"}>
              <DropdownMenu.Item asChild>
                <button
                  onClick={() => {
                    setCreateTokenDialogOpen(true);
                    setDropdownOpen(false);
                  }}
                  className={"py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 outline-none text-left"}>
                  Create token
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button onClick={() => {
                  setCreateDialogOpen(true);
                  setDropdownOpen(false);
                }} className={"py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 outline-none text-left"}>
                  Create instance
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  onClick={() => {
                    setRotateTokensDialogOpen(true);
                    setDropdownOpen(false);
                  }}
                  className={"py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-red-600 hover:text-white text-red-600 outline-none text-left"}>
                  Rotate tokens
                </button>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <button
                  onClick={() => {
                    setDestroyDialogOpen(true);
                    setDropdownOpen(false);
                  }}
                  className={"py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-red-600 hover:text-white text-red-600 outline-none text-left"}>
                  Destroy database
                </button>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <Dialog.Root open={rotateTokensDialogOpen} onOpenChange={setRotateTokensDialogOpen}>
          <RotateTokensModal hide={() => setRotateTokensDialogOpen(false)} dbName={data.Name}/>
        </Dialog.Root>
        <Dialog.Root open={createTokenDialogOpen} onOpenChange={setCreateTokenDialogOpen}>
          <CreateTokenModal hide={() => setCreateTokenDialogOpen(false)} dbName={data.Name}/>
        </Dialog.Root>
        <Dialog.Root open={destroyDialogOpen} onOpenChange={setDestroyDialogOpen}>
          <DestroyDatabaseModal dbName={data.Name}/>
        </Dialog.Root>
        <Dialog.Root open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <CreateInstanceModal hide={() => setCreateDialogOpen(false)} dbName={data.Name} />
        </Dialog.Root>
      </div>
      <div className={"text-xl font-medium mb-2"}>
        {instances.length === 0 ? "No" : instances.length} instances
      </div>
      {instances.length > 0 &&
        <div className={"flex flex-col gap-4 mb-4"}>
          {instances.map((instance) => {
            return (
              <a key={instance.name} href={`/database/${data.Name}/instance/${instance.name}`} className={"group transition ease-in-out duration-200 py-2 px-3 border border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600 rounded-lg flex items-center justify-between"}>
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
              </a>
            );
          })}
        </div>
      }
      <div className={"text-xl font-medium"}>
        Primary Region
      </div>
      <div className={"opacity-75 mb-2"}>
        {data.primaryRegion ?? "None"}
      </div>
      <div className={"text-xl font-medium"}>
        Hostname
      </div>
      <div className={"opacity-75 mb-2"}>
        {data.Hostname}
      </div>
      <ConnectionUrl hostname={data.Hostname}/>
    </main>
  )
};