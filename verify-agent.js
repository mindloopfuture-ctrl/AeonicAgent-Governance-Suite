import { execSync } from "child_process";
import minimist from "minimist";
import 'dotenv/config';

const argv = minimist(process.argv.slice(2), {
  string: ["address", "safe", "cid"]
});

const CONTRACT = argv.address || process.env.AEONIC_AGENT_CONTRACT;
const SAFE = argv.safe || process.env.GNOSIS_SAFE_ADDRESS;
const CID  = argv.cid  || process.env.INITIAL_CID;

if (!CONTRACT || !SAFE || !CID) {
  console.error("❌ Faltan datos: --address <contrato> --safe <guardian> --cid <cid>");
  process.exit(1);
}

try {
  const cmd = `npx hardhat verify --network sepolia ${CONTRACT} ${SAFE} "${CID}" --show-stack-traces`;
  console.log("🔍", cmd);
  execSync(cmd, { stdio: "inherit" });
  console.log("✅ Verificación completada");
} catch (e) {
  console.error("💥 Error al verificar:", e.message);
  process.exit(1);
}