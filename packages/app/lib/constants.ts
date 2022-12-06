export const BASE_STRING =
  "This message will be used to generate derived Baby JubJub wallets";
export const CHARTER_CONTENT = "I accept the Aragon Charter";
export const CHAIN_ID = 5;
export const VOTE = 1;

// export const VERIFIER_CONTRACT = "0xd8b867f74c236e645a2984f8b0a1854a12c36cc6";
export const VOTING_CONTRACT = "0xf4ef16da1f057ffdebd9474e336d851fce8f8f0d";
export const CIRCUIT_WASM_URL = "/static/circuit.wasm";
export const CIRCUIT_ZKEY_URL = "/static/circuit.zkey";

const CIRCOM_CIRCUIT_LEVEL_COUNT = 7; // not used here
export const CIRCUIT_LEVEL_COUNT = CIRCOM_CIRCUIT_LEVEL_COUNT + 1;
export const VOTE_WEIGHT = 1;

export const ABI = [{
  "inputs": [{
    "internalType": "address",
    "name": "_verifierContractAddr",
    "type": "address",
  }],
  "stateMutability": "nonpayable",
  "type": "constructor",
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "address",
    "name": "creator",
    "type": "address",
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "id",
    "type": "uint256",
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "censusRoot",
    "type": "uint256",
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "charterHash",
    "type": "uint256",
  }],
  "name": "EventProcessCreated",
  "type": "event",
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "address",
    "name": "publisher",
    "type": "address",
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "id",
    "type": "uint256",
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "nullifier",
    "type": "uint256",
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "votevalue",
    "type": "uint256",
  }, {
    "indexed": false,
    "internalType": "uint64",
    "name": "weight",
    "type": "uint64",
  }],
  "name": "EventVote",
  "type": "event",
}, {
  "inputs": [],
  "name": "lastProcessID",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function",
}, {
  "inputs": [{
    "internalType": "uint256",
    "name": "censusRoot",
    "type": "uint256",
  }, { "internalType": "uint256", "name": "charterHash", "type": "uint256" }],
  "name": "newProcess",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "nonpayable",
  "type": "function",
}, {
  "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "name": "processes",
  "outputs": [
    { "internalType": "address", "name": "creator", "type": "address" },
    { "internalType": "uint256", "name": "censusRoot", "type": "uint256" },
    { "internalType": "uint256", "name": "charterHash", "type": "uint256" },
    { "internalType": "uint256", "name": "result", "type": "uint256" },
  ],
  "stateMutability": "view",
  "type": "function",
}, {
  "inputs": [
    { "internalType": "uint256", "name": "id", "type": "uint256" },
    { "internalType": "uint256", "name": "nullifier", "type": "uint256" },
    { "internalType": "uint64", "name": "votevalue", "type": "uint64" },
    { "internalType": "uint64", "name": "weight", "type": "uint64" },
    { "internalType": "uint256[2]", "name": "a", "type": "uint256[2]" },
    { "internalType": "uint256[2][2]", "name": "b", "type": "uint256[2][2]" },
    { "internalType": "uint256[2]", "name": "c", "type": "uint256[2]" },
  ],
  "name": "vote",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function",
}];
