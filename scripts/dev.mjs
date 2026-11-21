// « npm run dev » : lance le site (Next, port 3000) et les fonctions de api/ (port 3001) ensemble.
import { spawn } from "node:child_process";

const run = (cmd) => spawn(cmd, { stdio: "inherit", shell: true });
const api = run("npx tsx scripts/dev-api.ts");
const web = run("npx next dev");
const stop = () => { api.kill(); web.kill(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
web.on("exit", stop);
