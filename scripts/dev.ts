import { spawn } from "child_process";
import { watch } from "fs";

let bunProcess: ReturnType<typeof spawn>;

function startServer() {
  if (bunProcess) {
    bunProcess.kill("SIGINT");
  }
  
  bunProcess = spawn("bun", ["run", "start"], {
    stdio: "inherit",
    shell: true,
  });

  bunProcess.on("close", (code) => {
    console.log(`Bun process exited with code ${code}`);
  });
}


watch(".", { recursive: true }, (eventType, filename) => {
  if (filename?.endsWith(".ts") || filename?.endsWith(".tsx")) {
    console.log(`File ${filename} changed. Restarting server...`);
    startServer();
  }
});


startServer();

process.on("SIGINT", () => {
  bunProcess.kill("SIGINT");
  process.exit();
});
