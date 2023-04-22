export enum Region {
    ams,
    arn,
    bog,
    bos,
    cdg,
    den,
    dfw,
    ewr,
    fra,
    gdl,
    gig,
    gru,
    hkg,
    iad,
    jnb,
    lax,
    lhr,
    maa,
    mad,
    mia,
    nrt,
    ord,
    otp,
    qro,
    scl,
    sea,
    sin,
    sjc,
    syd,
    waw,
    yul,
    yyz
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

    async listDatabases() {
        const res = await this.get("databases");
        const databases = (await res.json()).databases as Database[];
        
        return databases;
    }

    async getDatabase(name: string) {
        const databases = await this.listDatabases();

        return databases.find((database) => database.Name === name);
    }

    async listDatabaseInstances(name: string) {
        const res = await this.get(`databases/${name}/instances`);
        const instances = (await res.json()).instances as DatabaseInstance[];

        return instances;
    }

    async getDatabaseInstance(dbName: string, instanceName: string) {
        const instances = await this.listDatabaseInstances(dbName);

        return instances.find((instance) => instance.name === instanceName);
    }
}