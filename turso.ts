export enum Region {
    ams = "ams",
    arn = "arn",
    bog = "bog",
    bos = "bos",
    cdg = "cdg",
    den = "den",
    dfw = "dfw",
    ewr = "ewr",
    fra = "fra",
    gdl = "gdl",
    gig = "gig",
    gru = "gru",
    hkg = "hkg",
    iad = "iad",
    jnb = "jnb",
    lax = "lax",
    lhr = "lhr",
    maa = "maa",
    mad = "mad",
    mia = "mia",
    nrt = "nrt",
    ord = "ord",
    otp = "otp",
    qro = "qro",
    scl = "scl",
    sea = "sea",
    sin = "sin",
    sjc = "sjc",
    syd = "syd",
    waw = "waw",
    yul = "yul",
    yyz = "yyz"
}

export type Database = {
    Name: string,
    Hostname: string,
    IssuedCertLimit: number,
    IssuedCertCount: number,
    DbId: string,
    regions: Region[],
    primaryRegion: string,
    type: string
};

export type DatabaseInstance = {
    uuid: string,
    name: string,
    type: "primary" | "replica",
    region: Region,
    hostname: string
};

export enum TursoError {
    AUTHENTICATED_REQUIRED,
    DATABASE_LIMIT,
    BAD_REQUEST,
    NOT_FOUND
}

export type CreateDatabaseArgs = {
    name: string,
    region: Region,
    image: "latest" | "canary"
};

export type CreateDatabaseInstanceArgs = {
    dbName: string,
    instance_name?: string,
    password?: string,
    region: Region,
    image: "latest" | "canary"
};

export class Turso {
    url: string;
    token: string;

    constructor(url: string, token: string) {
        this.url = url;
        this.token = token;
    }

    private async get(endpoint: string) {
        const res = await fetch(`${this.url}/${endpoint}`, {
            credentials: "include",
            headers: {
                "authorization": `Bearer ${this.token}`
            }
        });

        return res;
    }

    private async post(endpoint: string, body: Record<string, any>) {
        const res = await fetch(`${this.url}/${endpoint}`, {
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${this.token}`
            },
            method: "POST",
            body: JSON.stringify(body)
        });

        return res;
    }

    private async delete(endpoint: string) {
        const res = await fetch(`${this.url}/${endpoint}`, {
            credentials: "include",
            headers: {
                "authorization": `Bearer ${this.token}`
            },
            method: "DELETE"
        });

       return res;
    }

    async listDatabases() {
        const res = await this.get("databases");
        if (res.status === 401) return TursoError.AUTHENTICATED_REQUIRED;
        const databases = (await res.json()).databases as Database[];
        
        return databases;
    }

    async getDatabase(name: string) {
        const databases = await this.listDatabases();
        if (databases === TursoError.AUTHENTICATED_REQUIRED) return databases;

        return databases.find((database) => database.Name === name);
    }

    async listDatabaseInstances(name: string) {
        const res = await this.get(`databases/${name}/instances`);
        if (res.status === 401) return TursoError.AUTHENTICATED_REQUIRED;
        const instances = (await res.json()).instances as DatabaseInstance[];

        return instances;
    }

    async getDatabaseInstance(dbName: string, instanceName: string) {
        const instances = await this.listDatabaseInstances(dbName);
        if (instances === TursoError.AUTHENTICATED_REQUIRED) return instances;

        return instances.find((instance) => instance.name === instanceName);
    }

    async createDatabase({name, region = Region.lax, image = "latest"}: CreateDatabaseArgs) {
        const res = await this.post(`databases`, {name, region, image});
        if (res.status === 401) return TursoError.AUTHENTICATED_REQUIRED;
        if (res.status === 422) return TursoError.DATABASE_LIMIT;

        return (await res.json()) as {
            database: Pick<Database, "Name" | "Hostname" | "IssuedCertLimit" | "IssuedCertCount" | "DbId">,
            username: string,
            password: string
        };
    }

    async deleteDatabase(name: string) {
        const res = await this.delete(`databases/${name}`);
        if (res.status === 401) return TursoError.AUTHENTICATED_REQUIRED;
        if (res.status === 404) return TursoError.NOT_FOUND;

        return (await res.json()) as {database: string};
    }

    async createDatabaseInstance({dbName, instance_name = "", password = "", region, image}: CreateDatabaseInstanceArgs) {
        const res = await this.post(`databases/${dbName}/instances`, {instance_name, password, region, image});
        if (res.status === 401) return TursoError.AUTHENTICATED_REQUIRED;
        if (res.status === 422) return TursoError.DATABASE_LIMIT;

        return (await res.json()) as {
            instance: DatabaseInstance,
            password: string,
            username: string
        };
    }

    async deleteDatabaseInstance(database: string, instance: string) {
        const res = await this.delete(`databases/${database}/instances/${instance}`);
        if (res.status === 401) return TursoError.AUTHENTICATED_REQUIRED;
        if (res.status === 400) return TursoError.BAD_REQUEST;
        if (res.status === 404) return TursoError.NOT_FOUND;

        return (await res.json()) as {
            instance: string
        };
    }
}