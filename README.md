# Overview

zkSNARK proof proves:
- User owns a key which is in the Census MerkleTree
- User signed their vote + the Charter document hash
- User vote has not already been casted

So, the user proves that is in the census but without revealing which key from the census! So the user does not reveal who they are. (Onchain Anonymous Voting)

The SmartContract verifies the zkSNARK proof and if it is correct, accepts the vote on-chain.


### Components

![](packages/CharterOAV-components.jpg)

### Flow

![](packages/CharterOAV-flow.jpg)
