const { newMemEmptyTrie, buildEddsa, buildPoseidonReference } = require(
  "circomlibjs",
);

window.getBundle = () => {
  return {
    newMemEmptyTrie,
    buildEddsa,
    buildPoseidonReference,
  };
};
