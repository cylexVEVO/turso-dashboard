"use server";

import { z } from "zod";
import { zact } from "zact/server";
import { Region, Turso } from "@/turso";
import { TursoError } from "@/turso";
import { revalidateTag } from "next/cache";

export const createDatabase = zact(
    z.object({
        name: z.string().trim().nonempty(),
        region: z.nativeEnum(Region),
        image: z.enum(["latest", "canary"]),
        instance: z.boolean(),
        token: z.string()
    })
)(
    async (input) => {
        const turso = new Turso(input.token);
        const dbRes = await turso.createDatabase({name: input.name, region: input.region, image: input.image});
        if (dbRes === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (dbRes === TursoError.DATABASE_LIMIT) return "database limit reached";

        if (input.instance) {
            const instanceRes = await turso.createDatabaseInstance({dbName: dbRes.database.Name, region: input.region, image: input.image});
            if (instanceRes === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
            if (instanceRes === TursoError.DATABASE_LIMIT) return "database limit reached";
        }

        revalidateTag("turso");
    }
);

export const createToken = zact(
    z.object({
        database: z.string().trim().nonempty(),
        expires: z.boolean(),
        readOnly: z.boolean(),
        token: z.string()
    })
)(
    async (input) => {
        const turso = new Turso(input.token);
        const token = await turso.createToken(input.database, input.expires ? "default" : "none", input.readOnly);
        if (token === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (token === TursoError.NOT_FOUND) return "database not found";

        return token;
    }
);

export const createInstance = zact(
    z.object({
        dbName: z.string().trim().nonempty(),
        region: z.nativeEnum(Region),
        image: z.enum(["latest", "canary"]),
        token: z.string()
    })
)(
    async (input) => {
        const turso = new Turso(input.token);
        const instance = await turso.createDatabaseInstance({dbName: input.dbName, region: input.region, image: input.image});
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.DATABASE_LIMIT) return "database limit reached";

        revalidateTag("turso");
    }
);

export const rotateTokens = zact(
    z.object({
        database: z.string().trim().nonempty(),
        token: z.string()
    })
)(
    async (input) => {
        const turso = new Turso(input.token);
        const instance = await turso.rotateTokens(input.database);
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.NOT_FOUND) return "database not found";
    }
);

export const destroyDatabase = zact(
    z.object({
        database: z.string().trim().nonempty(),
        token: z.string()
    })
)(
    async (input) => {
        const turso = new Turso(input.token);
        const instance = await turso.deleteDatabase(input.database);
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.NOT_FOUND) return "database not found";
    }
);

export const destroyInstance = zact(
    z.object({
        database: z.string().trim().nonempty(),
        instance: z.string().trim().nonempty(),
        token: z.string()
    })
)(
    async (input) => {
        const turso = new Turso(input.token);
        const instance = await turso.deleteDatabaseInstance(input.database, input.instance);
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.NOT_FOUND) return "database not found";
        if (instance === TursoError.BAD_REQUEST) return "cannot delete primary instance";
    }
);