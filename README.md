# 🛡️ Aeonic Safe Governance Panel

Panel web real para gestión de bóvedas **Gnosis Safe** y contratos **AeonicAgent** en Ethereum o Sepolia.

## 🚀 Instrucciones

1. Subir este archivo `index.html` a tu repositorio en GitHub.
2. En **Settings → Pages**, activa GitHub Pages (branch `main` / root).
3. Abre la web y conecta MetaMask.
4. Introduce:
   - **Safe Transaction Service URL** (`https://safe-transaction-sepolia.safe.global`)
   - **Dirección del Safe**
   - **Dirección del contrato AeonicAgent** (si existe)
5. Puedes:
   - Consultar estado (balance, owners, threshold, nonce).
   - Proponer una transacción al Safe (función `executeAutocorrection`).

## 🧠 Stack

- Tailwind CSS
- Ethers.js v6
- Safe Global SDKs (`protocol-kit`, `api-kit`)
- 100% client-side (no necesita backend).

---

Código diseñado para R‑M‑P — *Aeonic Governance Network 2025*.
