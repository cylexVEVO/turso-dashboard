"use client";

import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/solid";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useState } from "react";

export const Actions = ({dbName}: {dbName: string}) => {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu.Root open={open} onOpenChange={setOpen}>
          <DropdownMenu.Trigger asChild>
            <EllipsisHorizontalCircleIcon className="h-8 w-8 text-blue-600 hover:text-blue-500 active:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 dark:active:text-blue-600 transition ease-in-out duration-200" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="data-[state=open]:animate-fadeIn p-2 rounded-lg bg-white shadow-lg border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 flex flex-col"
              sideOffset={4}
              side={"bottom"}
              align={"end"}>
              <DropdownMenu.Item asChild>
                <Link href={`/database/${dbName}/create-token`} className="py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 outline-none text-left">
                  Create token
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href={`/database/${dbName}/create-instance`} className="py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 outline-none text-left">
                  Create instance
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href={`/database/${dbName}/rotate-tokens`} className="py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-red-600 hover:text-white text-red-600 outline-none text-left">
                  Rotate tokens
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link href={`/database/${dbName}/destroy-database`} className="py-2 px-4 rounded transition ease-in-out duration-200 hover:bg-red-600 hover:text-white text-red-600 outline-none text-left">
                  Destroy database
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}