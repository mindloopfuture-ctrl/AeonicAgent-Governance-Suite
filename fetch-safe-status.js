import axios from "axios";
import minimist from "minimist";
import { ethers } from "ethers";

const argv = minimist(process.argv.slice(2), { string: ["safe-address","service-url"] });
const SAFE = argv["safe-address"] || process.env.GNOSIS_SAFE_ADDRESS;
const SERVICE_URL = argv["service-url"] || process.env.SAFE_SERVICE_URL || "https://safe-transaction-sepolia.safe.global";

if (!SAFE || !/^0x[a-fA-F0-9]{40}$/.test(SAFE)) {
  console.error("❌ Dirección de Safe inválida");
  process.exit(1);
}

(async () => {
  console.log(`🔍 Estado Safe ${SAFE}`);
  const infoUrl = `${SERVICE_URL}/api/v1/safes/${SAFE}/`;
  const txsUrl = `${SERVICE_URL}/api/v1/safes/${SAFE}/multisig-transactions/?limit=5&ordering=-executionDate";
  try {
    const [info, txs] = await Promise.all([axios.get(infoUrl), axios.get(txsUrl)]);
    const balanceEth = ethers.formatEther(info.data.ethBalance || "0");
    console.log(`🏦 Balance: ${balanceEth} ETH`);
    console.log(`👥 Owners (${info.data.owners.length}) / Threshold: ${info.data.threshold}`);
    info.data.owners.forEach((o,i)=>console.log(`  ${i+1}. ${o}`));
    console.log("\n📜 Últimas transacciones:");
    txs.data.results.forEach((t)=>{
      console.log(`- ${t.safeTxHash} | ${t.isExecuted ? "✅ Ejecutada" : "⏳ Pendiente"} | Confs: ${(t.confirmations||[]).length}/${t.confirmationsRequired}`);
    });
  } catch(e){
    console.error("💥 Error al consultar:", e.message);
    process.exit(1);
  }
})();