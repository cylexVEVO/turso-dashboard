import {ensureDir, exists, ensureFile} from "https://deno.land/std@0.184.0/fs/mod.ts";
import {setHandler} from "https://deno.land/x/ctrlc@0.2.1/mod.ts";
import {open} from "https://deno.land/x/open@v0.0.6/index.ts";

const dir = `${Deno.env.get("HOME")}/.turso-dashboard`;
const gitDir = `${dir}/turso-dashboard`;

// clone repo if needed
let justCloned = false;
await ensureDir(dir);
if (!await exists(gitDir)) {
    console.log("Downloading dashboard...");
    const git = Deno.run({
        cmd: [
            "git",
            "clone",
            "https://github.com/cylexVEVO/turso-dashboard"
        ],
        cwd: dir,
        stdout: "null"
    });

    await git.status();

    console.log("Installing dependencies...");
    const npm = Deno.run({
        cmd: [
            "npm",
            "install"
        ],
        cwd: gitDir,
        stdout: "null"
    });

    await npm.status();
    justCloned = true;
}

// fetch latest updates
if (!justCloned) {
    console.log("Checking for updates...");
    const git = Deno.run({
        cmd: [
            "git",
            "fetch"
        ],
        cwd: gitDir,
        stdout: "null"
    });

    await git.status();

    const npm = Deno.run({
        cmd: [
            "npm",
            "install"
        ],
        cwd: gitDir,
        stdout: "null"
    });

    await npm.status();
}

// get turso token
console.log("Getting Turso token...");
let token = "";
try {
    const file = await Deno.readTextFile(`${Deno.env.get("HOME")}/.config/turso/settings.json`);
    token = JSON.parse(file).token;
} catch {
    const result = prompt("Failed to automatically get Turso token. Please enter it manually:");
    if (result === null) {
        console.log("No token provided, exiting...");
        Deno.exit(1);
    }
}

// write token to .env file
await ensureFile(`${gitDir}/.env`);
await Deno.writeTextFile(`${gitDir}/.env`, `NEXT_PUBLIC_TURSO_TOKEN=${token}`);

// build and run
console.log("Starting dashboard...");
const build = Deno.run({
    cmd: [
        "npm",
        "run",
        "build"
    ],
    cwd: gitDir,
    stdout: "null"
});

await build.status();

const proxy = Deno.run({
    cmd: [
        "node",
        "scripts/proxy.js"
    ],
    cwd: gitDir,
    stdout: "null"
});

const start = Deno.run({
    cmd: [
        "npm",
        "run",
        "start"
    ],
    cwd: gitDir,
    stdout: "null"
});

// open in browser
console.log("Opening in browser...");
setTimeout(() => open("http://localhost:3000"), 500);

setHandler(() => {
    console.log("Stopping...");
    proxy.kill();
    start.kill();
    Deno.exit(0);
});