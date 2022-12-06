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
