const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { ethers } = require('ethers');
const Safe = require('@safe-global/protocol-kit').default;
const { EthersAdapter } = require('@safe-global/protocol-kit');
const SafeApiKit = require('@safe-global/api-kit').default;

const isCid = (cid) => /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[\w\d]{50,})$/.test(cid);
const die = (m) => { console.error(`❌ ${m}`); process.exit(1); };

function loadConfig(cfgPath) {
  if (!cfgPath) return {};
  const p = path.resolve(process.cwd(), cfgPath);
  if (!fs.existsSync(p)) die(`No existe config: ${p}`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const argv = minimist(process.argv.slice(2), { string: ['cid','score','config'] });
const CID   = argv.cid   || argv._[0];
const SCORE = parseInt(argv.score || argv._[1], 10);
const cfg   = loadConfig(argv.config);

const PROVIDER_URL = process.env.PROVIDER_URL || cfg.providerUrl;
const SAFE_ADDRESS = process.env.SAFE_ADDRESS || cfg.safeAddress;
const AEONIC_AGENT = process.env.AEONIC_AGENT_CONTRACT || cfg.contractAddress;
const SAFE_SERVICE_URL = cfg.serviceUrl || process.env.SAFE_SERVICE_URL || 'https://safe-transaction-sepolia.safe.global';
const CHAIN_ID = Number(process.env.CHAIN_ID || cfg.chainId || 11155111);
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

if (!CID || !isCid(CID)) die(`CID inválido: ${CID}`);
if (!Number.isInteger(SCORE) || SCORE < 0) die(`Integrity Score inválido: ${argv.score || argv._[1]}`);
if (!PROVIDER_URL) die('Falta PROVIDER_URL');
if (!SAFE_ADDRESS || !/^0x[a-fA-F0-9]{40}$/.test(SAFE_ADDRESS)) die(`SAFE_ADDRESS inválido: ${SAFE_ADDRESS}`);
if (!AEONIC_AGENT || !/^0x[a-fA-F0-9]{40}$/.test(AEONIC_AGENT)) die(`AEONIC_AGENT_CONTRACT inválido: ${AEONIC_AGENT}`);
if (!SIGNER_PRIVATE_KEY || !/^0x[0-9a-fA-F]{64}$/.test(SIGNER_PRIVATE_KEY)) die('Falta SIGNER_PRIVATE_KEY válido');

const AEONIC_ABI_EXEC = [
  "function executeAutocorrection(uint256 integrityScore, string calldata newGeneticHash) external"
];

(async () => {
  console.log('🔐 Iniciando propuesta segura…');
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL, CHAIN_ID);
  const signer = new ethers.Wallet(SIGNER_PRIVATE_KEY, provider);

  const iface = new ethers.Interface(AEONIC_ABI_EXEC);
  const encodedData = iface.encodeFunctionData('executeAutocorrection', [ethers.toBigInt(SCORE), CID]);

  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
  const safeSdk = await Safe.create({ ethAdapter, safeAddress: SAFE_ADDRESS });

  const safeTxData = { to: AEONIC_AGENT, data: encodedData, value: '0', operation: 0 };
  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData: safeTxData });
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
  const signature = await safeSdk.signTransactionHash(safeTxHash);

  const apiKit = new SafeApiKit({ txServiceUrl: SAFE_SERVICE_URL, ethAdapter });
  await apiKit.proposeTransaction({
    safeAddress: SAFE_ADDRESS,
    safeTransactionData: safeTxData,
    safeTxHash,
    senderAddress: await signer.getAddress(),
    senderSignature: signature.data
  });

  console.log(`safeTxHash: ${safeTxHash}`);
  console.log('✅ Propuesta enviada al Safe Transaction Service.');
})().catch((err)=>{ console.error('💥 Error:', err.message || err); process.exit(1); });