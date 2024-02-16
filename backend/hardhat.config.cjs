require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/JVFHW5c5MXnRUxytlY26K8jE8CYtzMUb`,
            accounts: [
                `0x07df9d114b79521bc10ba50e9d026a62b2fec4913ecb28c0cf74cc69f0e87b90`,
            ],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: "2NBVE5FYYTPI9WNQRW4ZX9GQAUE9F86EK3",
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        gasPriceApi:
            "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
        coinmarketcap: "d9f77759-d3a3-42ef-9db1-fb64594f7adf",
    },
};
