import { fileURLToPath } from "url";
import process from "process";
import path from "path";
import fs from "fs-extra";
import { spawn } from "child_process";
import ngrok from "@ngrok/ngrok";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async function () {
  // expose port 3000, so that the Synthetic Loom API can be accessed from within the WebContainer
  const listener = await ngrok.forward({
    addr: 3000,
    authtoken_from_env: true,
  });
  const listenerUrl = listener.url();
  console.log(`Ingress established at: ${listenerUrl}`);

  // write the ngrok url to the runtime/.env file, so that the WebContainer can use it
  const envData = {
    NEXT_PUBLIC_SYNTHETICLOOM_URL: listenerUrl,
  };
  await fs.writeFile(
    path.join(__dirname, "../runtime/.env"),
    Object.entries(envData)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n")
  );

  // start the Next.js server
  const nextJsProcess = spawn("npx", ["next", "dev", "--turbo"], {
    stdio: "inherit", // Redirects stdout, stderr, and stdin to the parent process
    shell: true, // Enables shell commands for compatibility
  });

  // when the Next.js server process exits, exit the parent process
  nextJsProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Process exited with code ${code}`);
    }
    process.exit(code);
  });
})();
