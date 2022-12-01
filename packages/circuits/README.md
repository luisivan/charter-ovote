# CM-OAV: Charter Member Onchain Anonymous Voting, using the OVOTE census

CM-OAV is a fork from the OAV circuit: https://github.com/aragonzkresearch/ovote/blob/07f50f5f170d7052f6ceb7eb6b9db62187658c49/circuits/src/oav.circom
OAV: Onchain Anonymous Voting, uses the OVOTE census (so the same census can be reused both for onchain anonymous voting (OAV) and offchain binding voting (OVOTE)).
The OAV follows the same design done in the Vochain https://github.com/vocdoni/zk-franchise-proof-circuit but adapted to the OVOTE census data structure.


The CM-OAV circuit checks:
- user proves that owns a key which is in the Census MerkleTree
- user signs their vote + the Charter hash
- user computs their nullifier, which is used by the smart contract to ensure that the same user does not vote twice

## Test
- Needs installed: [circom](https://github.com/iden3/circom), and [nodejs](https://nodejs.org) (version: >16)
- Install the dependencies: `npm install`
- Run the tests: `npm run test`
