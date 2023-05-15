"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import React from "react";

const Root = ({children}: {children: React.ReactNode}) => {
    const router = useRouter();

    return (
        <>
            <div onClick={() => router.back()} className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fadeIn cursor-default" />
            <div className="animate-fadeIn fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-7 bg-bgLight dark:bg-bgDark shadow-md max-h-[85vh] w-[90vw] max-w-5xl rounded-lg">
                <button onClick={() => router.back()} className="absolute top-4 right-4 h-6 w-6 opacity-50 hover:opacity-100 transition ease-in-out duration-200">
                    <XMarkIcon />
                </button>
                {children}
            </div>
        </>
    );
};

const Title = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="text-3xl font-bold mb-4">
            {children}
        </div>
    );
};

const Fields = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="flex flex-col gap-2 mb-4">
            {children}
        </div>
    );
};

const Description = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="mb-4">
            {children}
        </div>
    );
};

const Actions = ({children}: {children: React.ReactNode}) => {
    return (
        <div className={"flex justify-end gap-4"}>
            {children}
        </div>
    );
};

export const Modal = {
    Root,
    Title,
    Fields,
    Description,
    Actions
};