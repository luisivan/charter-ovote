export const ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "caller",
        "type": "address",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256",
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool",
      },
    ],
    "name": "EventProcessClosed",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "creator",
        "type": "address",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionHash",
        "type": "uint256",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "censusRoot",
        "type": "uint256",
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "censusSize",
        "type": "uint64",
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "resPubStartBlock",
        "type": "uint64",
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "resPubWindow",
        "type": "uint64",
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "minParticipation",
        "type": "uint8",
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "typ",
        "type": "uint8",
      },
    ],
    "name": "EventProcessCreated",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "publisher",
        "type": "address",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "receiptsRoot",
        "type": "uint256",
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "result",
        "type": "uint64",
      },
      {
        "indexed": false,
        "internalType": "uint64",
        "name": "nVotes",
        "type": "uint64",
      },
    ],
    "name": "EventResultPublished",
    "type": "event",
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256",
      },
    ],
    "name": "closeProcess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "inputs": [],
    "name": "lastProcessID",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "transactionHash",
        "type": "uint256",
      },
      {
        "internalType": "uint256",
        "name": "censusRoot",
        "type": "uint256",
      },
      {
        "internalType": "uint64",
        "name": "censusSize",
        "type": "uint64",
      },
      {
        "internalType": "uint64",
        "name": "resPubStartBlock",
        "type": "uint64",
      },
      {
        "internalType": "uint64",
        "name": "resPubWindow",
        "type": "uint64",
      },
      {
        "internalType": "uint8",
        "name": "minParticipation",
        "type": "uint8",
      },
      {
        "internalType": "uint8",
        "name": "typ",
        "type": "uint8",
      },
    ],
    "name": "newProcess",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256",
      },
    ],
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256",
      },
    ],
    "name": "processes",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address",
      },
      {
        "internalType": "uint256",
        "name": "transactionHash",
        "type": "uint256",
      },
      {
        "internalType": "uint256",
        "name": "censusRoot",
        "type": "uint256",
      },
      {
        "internalType": "uint64",
        "name": "censusSize",
        "type": "uint64",
      },
      {
        "internalType": "uint64",
        "name": "resPubStartBlock",
        "type": "uint64",
      },
      {
        "internalType": "uint64",
        "name": "resPubWindow",
        "type": "uint64",
      },
      {
        "internalType": "uint8",
        "name": "minParticipation",
        "type": "uint8",
      },
      {
        "internalType": "uint8",
        "name": "typ",
        "type": "uint8",
      },
      {
        "internalType": "bool",
        "name": "closed",
        "type": "bool",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256",
      },
      {
        "internalType": "uint256",
        "name": "receiptsRoot",
        "type": "uint256",
      },
      {
        "internalType": "uint64",
        "name": "result",
        "type": "uint64",
      },
      {
        "internalType": "uint64",
        "name": "nVotes",
        "type": "uint64",
      },
      {
        "internalType": "uint256[2]",
        "name": "a",
        "type": "uint256[2]",
      },
      {
        "internalType": "uint256[2][2]",
        "name": "b",
        "type": "uint256[2][2]",
      },
      {
        "internalType": "uint256[2]",
        "name": "c",
        "type": "uint256[2]",
      },
    ],
    "name": "publishResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256",
      },
    ],
    "name": "results",
    "outputs": [
      {
        "internalType": "address",
        "name": "publisher",
        "type": "address",
      },
      {
        "internalType": "uint256",
        "name": "receiptsRoot",
        "type": "uint256",
      },
      {
        "internalType": "uint64",
        "name": "result",
        "type": "uint64",
      },
      {
        "internalType": "uint64",
        "name": "nVotes",
        "type": "uint64",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
];
