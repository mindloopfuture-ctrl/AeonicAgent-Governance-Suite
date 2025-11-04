require('@nomicfoundation/hardhat-ethers');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: LOCAL_RPC_URL, chainId: 31337 },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
      gas: "auto",
      gasPrice: "auto"
    }
  },
  paths: {
    sources: "./",
    artifacts: "./artifacts",
    cache: "./cache"
  },
  mocha: { timeout: 60000 }
};