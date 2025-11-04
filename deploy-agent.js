const { ethers } = require("hardhat");
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2), {
  string: ["safe", "cid"],
  alias: { safe: "guardian", cid: "genetic" }
});

const SAFE = argv.safe || argv.guardian;
const CID = argv.cid || argv.genetic;

function isEthAddress(a){ return /^0x[a-fA-F0-9]{40}$/.test(a); }
function isCid(c){ return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[\w\d]{50,})$/.test(c); }
const die = (m)=>{ console.error("❌ "+m); process.exit(1); };

async function main() {
  console.log("🚀 Desplegando AeonicAgent…");
  if (!SAFE || !isEthAddress(SAFE)) die(`Guardian/Safe inválido: ${SAFE}`);
  if (!CID || !isCid(CID)) die(`CID inválido: ${CID}`);

  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  console.log(`🔧 Red: ${net.name} (${net.chainId})`);
  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`🛡️ Guardian(Safe): ${SAFE}`);
  console.log(`🧬 CID inicial: ${CID}`);

  const bal = await ethers.provider.getBalance(deployer.address);
  if (bal < ethers.parseEther("0.02")) die("Fondos insuficientes (<0.02 ETH)");

  const Aeonic = await ethers.getContractFactory("AeonicAgent", deployer);
  const contract = await Aeonic.deploy(SAFE, CID);
  await contract.waitForDeployment();

  const addr = await contract.getAddress();
  const tx = contract.deploymentTransaction();
  const rcp = await tx.wait(2);

  console.log(`✅ Deploy OK: ${addr}`);
  console.log(`🔗 TX: ${tx.hash} | block ${rcp.blockNumber}`);
  console.log("\nExporta esto en tu .env:");
  console.log(`AEONIC_AGENT_CONTRACT=${addr}`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });