require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    gasReporter: {
        enabled: true,
        currency: "USD",
        gasPriceApi:
            "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
        coinmarketcap: "d9f77759-d3a3-42ef-9db1-fb64594f7adf",
    },
};
