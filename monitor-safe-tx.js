const minimist = require('minimist');
const axios = require('axios');

const argv = minimist(process.argv.slice(2), {
  string: ['safe-tx-hash','service-url','safe-address'],
  default: { 'max-retries': 60, interval: 30000 }
});

const TX_HASH = argv['safe-tx-hash'];
const SERVICE_URL = argv['service-url'] || process.env.SAFE_SERVICE_URL || 'https://safe-transaction-sepolia.safe.global';
const SAFE = argv['safe-address'];
const MAX = Number(argv['max-retries']);
const INTERVAL = Number(argv['interval']);

if (!TX_HASH || !/^0x[a-fA-F0-9]{64}$/.test(TX_HASH)) { console.error(`❌ SAFE_TX_HASH inválido: ${TX_HASH}`); process.exit(1); }
if (!SERVICE_URL.startsWith('http')) { console.error(`❌ SAFE_SERVICE_URL inválida: ${SERVICE_URL}`); process.exit(1); }

const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));

(async ()=>{
  console.log(`📡 Monitoreo Safe: ${SAFE || '(no provisto)'} | Hash: ${TX_HASH}`);
  let lastConfs = 0;
  for (let i=1;i<=MAX;i++){
    try{
      const url = `${SERVICE_URL}/api/v1/multisig-transactions/${TX_HASH}/`;
      const { data: tx } = await axios.get(url, { timeout: 15000 });
      const confs = Array.isArray(tx.confirmations) ? tx.confirmations.length : 0;
      const required = tx.confirmationsRequired ?? 'N/A';
      const executed = !!tx.isExecuted;

      if (confs !== lastConfs) {
        console.log(`👥 Confirmaciones: ${confs}/${required}`);
        lastConfs = confs;
      }
      console.log(`🕓 Intento ${i}/${MAX} | Ejecutado: ${executed}`);

      if (executed) { console.log('✅ Ejecutada.'); process.exit(0); }
    }catch(e){
      console.log(`⚠️ Error intento ${i}: ${e.response?.status || e.message}`);
    }
    await sleep(INTERVAL);
  }
  console.error('⏰ Timeout: no ejecutada aún.'); process.exit(1);
})().catch((e)=>{ console.error('💥', e.message || e); process.exit(1); });