const hre = require("hardhat");

async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();

  const VoterData = await hre.ethers.getContractFactory("VoterDataMerkle");
  const voterData = await VoterData.deploy();


  await voting.deployed();
  await voterData.deployed();

  console.log("Voting contract deployed to:", voting.address);
  console.log("Voter Data contract deployed to:", voterData.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
