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

export const regions = [
  { code: "ams", location: "Amsterdam, Netherlands" },
  { code: "arn", location: "Stockholm, Sweden" },
  { code: "atl", location: "Atlanta, Georgia (US)" },
  { code: "bog", location: "Bogotá, Colombia" },
  { code: "bos", location: "Boston, Massachusetts (US)" },
  { code: "cdg", location: "Paris, France" },
  { code: "den", location: "Denver, Colorado (US)" },
  { code: "dfw", location: "Dallas, Texas (US)" },
  { code: "ewr", location: "Secaucus, NJ (US)" },
  { code: "eze", location: "Ezeiza, Argentina" },
  { code: "fra", location: "Frankfurt, Germany" },
  { code: "gdl", location: "Guadalajara, Mexico" },
  { code: "gig", location: "Rio de Janeiro, Brazil" },
  { code: "gru", location: "São Paulo, Brazil" },
  { code: "hkg", location: "Hong Kong, Hong Kong" },
  { code: "iad", location: "Ashburn, Virginia (US)" },
  { code: "jnb", location: "Johannesburg, South Africa" },
  { code: "lax", location: "Los Angeles, California (US)" },
  { code: "lhr", location: "London, United Kingdom" },
  { code: "maa", location: "Chennai (Madras), India" },
  { code: "mad", location: "Madrid, Spain" },
  { code: "mia", location: "Miami, Florida (US)" },
  { code: "nrt", location: "Tokyo, Japan" },
  { code: "ord", location: "Chicago, Illinois (US)" },
  { code: "otp", location: "Bucharest, Romania" },
  { code: "qro", location: "Querétaro, Mexico" },
  { code: "scl", location: "Santiago, Chile" },
  { code: "sea", location: "Seattle, Washington (US)" },
  { code: "sin", location: "Singapore, Singapore" },
  { code: "sjc", location: "San Jose, California (US)" },
  { code: "syd", location: "Sydney, Australia" },
  { code: "waw", location: "Warsaw, Poland" },
  { code: "yul", location: "Montreal, Canada" },
  { code: "yyz", location: "Toronto, Canada" }
] as const;

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
    AUTHENTICATION_REQUIRED,
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
    token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async get(endpoint: string) {
        const res = await fetch(`https://api.turso.io/v2/${endpoint}`, {
            credentials: "include",
            headers: {
                "authorization": `Bearer ${this.token}`
            },
            cache: "no-store",
            next: {
                tags: ["turso"]
            }
        });

        return res;
    }

    private async post(endpoint: string, body?: Record<string, any>) {
        const res = await fetch(`https://api.turso.io/v2/${endpoint}`, {
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "authorization": `Bearer ${this.token}`
            },
            method: "POST",
            body: body !== null ? JSON.stringify(body) : "",
            cache: "no-store",
            next: {
                tags: ["turso"]
            }
        });

        return res;
    }

    private async delete(endpoint: string) {
        const res = await fetch(`https://api.turso.io/v2/${endpoint}`, {
            credentials: "include",
            headers: {
                "authorization": `Bearer ${this.token}`
            },
            method: "DELETE",
            cache: "no-store",
            next: {
                tags: ["turso"]
            }
        });

       return res;
    }

    async listDatabases() {
        const res = await this.get("databases");
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        const databases = (await res.json()).databases as Database[];
        
        return databases;
    }

    async getDatabase(name: string) {
        const databases = await this.listDatabases();
        if (databases === TursoError.AUTHENTICATION_REQUIRED) return databases;

        return databases.find((database) => database.Name === name);
    }

    async listDatabaseInstances(name: string) {
        const res = await this.get(`databases/${name}/instances`);
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        const instances = (await res.json()).instances as DatabaseInstance[];

        return instances;
    }

    async getDatabaseInstance(dbName: string, instanceName: string) {
        const instances = await this.listDatabaseInstances(dbName);
        if (instances === TursoError.AUTHENTICATION_REQUIRED) return instances;

        return instances.find((instance) => instance.name === instanceName);
    }

    async createDatabase({name, region = Region.lax, image = "latest"}: CreateDatabaseArgs) {
        const res = await this.post(`databases`, {name, region, image});
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        if (res.status === 400) return TursoError.DATABASE_LIMIT;

        return (await res.json()) as {
            database: Pick<Database, "Name" | "Hostname" | "IssuedCertLimit" | "IssuedCertCount" | "DbId">,
            username: string,
            password: string
        };
    }

    async deleteDatabase(name: string) {
        const res = await this.delete(`databases/${name}`);
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        if (res.status === 404) return TursoError.NOT_FOUND;

        return (await res.json()) as {database: string};
    }

    async createDatabaseInstance({dbName, instance_name = "", password = "", region, image}: CreateDatabaseInstanceArgs) {
        const res = await this.post(`databases/${dbName}/instances`, {instance_name, password, region, image});
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        if (res.status === 400) return TursoError.DATABASE_LIMIT;

        return (await res.json()) as {
            instance: DatabaseInstance,
            password: string,
            username: string
        };
    }

    async deleteDatabaseInstance(database: string, instance: string) {
        const res = await this.delete(`databases/${database}/instances/${instance}`);
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        if (res.status === 400) return TursoError.BAD_REQUEST;
        if (res.status === 404) return TursoError.NOT_FOUND;

        return (await res.json()) as {
            instance: string
        };
    }

    async createToken(database: string, expiration: "default" | "none", readOnly: boolean) {
        const res = await this.post(`databases/${database}/auth/tokens?expiration=${expiration}${readOnly ? "&authorization=read-only" : ""}`);
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        if (res.status === 404) return TursoError.NOT_FOUND;

        return (await res.json()) as {
            jwt: string
        };
    }

    async rotateTokens(database: string) {
        const res = await this.post(`databases/${database}/auth/rotate`);
        if (res.status === 401) return TursoError.AUTHENTICATION_REQUIRED;
        if (res.status === 404) return TursoError.NOT_FOUND;
    }
}