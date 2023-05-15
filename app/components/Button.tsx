"use client";

import Link from "next/link";
import React from "react";

type ButtonProps = {
    color?: "primary" | "secondary" | "red";
    size?: "regular" | "small";
    href?: string;
};

const classes = {
    primary: "bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white",
    secondary: "bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:active:bg-neutral-800",
    red: "bg-red-600 hover:bg-red-500 active:bg-red-700 text-white",
    regular: "py-1.5 px-4",
    small: "py-1 px-3"
};

export const Button: React.FC<ButtonProps & Omit<React.HTMLProps<HTMLButtonElement>, "size" | "type">> = ({color = "primary", size = "regular", href, ...props}) => {
    if (href) {
        return (
            <Link href={href} className={`transition ease-in-out duration-200 flex items-center gap-1 rounded-lg ${classes[color]} ${classes[size]}`}>
                {props.children}
            </Link>
        );
    }

    return (
        <button {...props} className={`transition ease-in-out duration-200 flex items-center gap-1 rounded-lg disabled:opacity-50 disabled:pointer-events-none ${classes[color]} ${classes[size]}`}>
            {props.children}
        </button>
    );
}