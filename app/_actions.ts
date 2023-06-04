"use server";

import { z } from "zod";
import { zact } from "zact/server";
import { Region, Turso } from "@/turso";
import { TursoError } from "@/turso";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { LibsqlError, ResultSet, createClient } from "@libsql/client/web";

export const createDatabase = zact(
    z.object({
        name: z.string().trim().nonempty(),
        region: z.nativeEnum(Region),
        image: z.enum(["latest", "canary"]),
        instance: z.boolean()
    })
)(
    async (input) => {
        const token = cookies().get("token");
        if (!token) return "authentication required";
        const turso = new Turso(token.value);
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
        readOnly: z.boolean()
    })
)(
    async (input) => {
        const token = cookies().get("token");
        if (!token) return "authentication required";
        const turso = new Turso(token.value);
        const dbToken = await turso.createToken(input.database, input.expires ? "default" : "none", input.readOnly);
        if (dbToken === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (dbToken === TursoError.NOT_FOUND) return "database not found";

        return dbToken;
    }
);

export const createInstance = zact(
    z.object({
        dbName: z.string().trim().nonempty(),
        region: z.nativeEnum(Region),
        image: z.enum(["latest", "canary"])
    })
)(
    async (input) => {
        const token = cookies().get("token");
        if (!token) return "authentication required";
        const turso = new Turso(token.value);
        const instance = await turso.createDatabaseInstance({dbName: input.dbName, region: input.region, image: input.image});
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.DATABASE_LIMIT) return "database limit reached";

        revalidateTag("turso");
    }
);

export const rotateTokens = zact(
    z.object({
        database: z.string().trim().nonempty()
    })
)(
    async (input) => {
        const token = cookies().get("token");
        if (!token) return "authentication required";
        const turso = new Turso(token.value);
        const instance = await turso.rotateTokens(input.database);
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.NOT_FOUND) return "database not found";
    }
);

export const destroyDatabase = zact(
    z.object({
        database: z.string().trim().nonempty()
    })
)(
    async (input) => {
        const token = cookies().get("token");
        if (!token) return "authentication required";
        const turso = new Turso(token.value);
        const instance = await turso.deleteDatabase(input.database);
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.NOT_FOUND) return "database not found";
    }
);

export const destroyInstance = zact(
    z.object({
        database: z.string().trim().nonempty(),
        instance: z.string().trim().nonempty()
    })
)(
    async (input) => {
        const token = cookies().get("token");
        if (!token) return "authentication required";
        const turso = new Turso(token.value);
        const instance = await turso.deleteDatabaseInstance(input.database, input.instance);
        if (instance === TursoError.AUTHENTICATION_REQUIRED) return "authentication required";
        if (instance === TursoError.NOT_FOUND) return "database not found";
        if (instance === TursoError.BAD_REQUEST) return "cannot delete primary instance";
    }
);

export const setCookie = zact(
    z.object({
        token: z.string().trim().nonempty()
    })
)(
    async (input) => {
        // @ts-expect-error types aren't correct yet
        cookies().set("token", input.token);
    }
);

export const shellProxy = zact(
    z.object({
        token: z.string().trim().nonempty(),
        url: z.string().url(),
        query: z.string()
    })
)(
    async (input) => {
        const client = createClient({
            url: input.url,
            authToken: input.token
        });

        let res: ResultSet | { code: string, message: string } | null = null;

        const queryStart = new Date();

        try {
            res = await client.execute(input.query);
        } catch (e) {
            res = { code: (e as LibsqlError).code, message: (e as LibsqlError).message };
        }

        const queryTime = +new Date() - +queryStart;

        return {
            res,
            time: queryTime
        };
    }
);