const { newMemEmptyTrie, buildEddsa, buildPoseidonReference } = require(
  "circomlibjs",
);
const { groth16, zKey } = require("snarkjs");

window.getBundle = () => {
  return {
    newMemEmptyTrie,
    buildEddsa,
    buildPoseidonReference,
    groth16,
    zKey,
  };
};
