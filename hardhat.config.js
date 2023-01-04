require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {},
    goerli: {
      url: "https://goerli.infura.io/v3/13f238d3eb464b8685d5571c769fae41",
      accounts: [
        "c0cf935e9f6903377138753134c8492dd21b65bbdaccb7528d9dbc0b6ff1d5c6",
      ],
    },
  },
  etherscan: {
    apiKey: "GZQIQDBGSR7S96VQ62RR11G31PWHIYH97J",
  },
};
