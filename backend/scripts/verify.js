// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const {
    getDoctorsHexMerkleRoot,
    getPatientsHexMerkleRoot,
    getPharmaciesHexMerkleRoot,
} = require('../test/whitelists/merkletrees');
const {
    PATIENT_CONTRACT_ADDRESS,
    PHARMACY_CONTRACT_ADDRESS,
    DOCTOR_CONTRACT_ADDRESS,
    SOCIALSECURITY_CONTRACT_ADDRESS,
    LABORATORY_CONTRACT_ADDRESS,
    EXCHANGER_CONTRACT_ADRESS,
    NFTXP_BASEURI,
    NFTXM_BASEURI,
} = require('./constants');

async function main() {
    // Patient contract
    await hre.run('verify:verify', {
        address: PATIENT_CONTRACT_ADDRESS,
        constructorArguments: [getPatientsHexMerkleRoot()],
    });

    // Pharmacy contract
    await hre.run('verify:verify', {
        address: PHARMACY_CONTRACT_ADDRESS,
        constructorArguments: [getPharmaciesHexMerkleRoot()],
    });

    // Doctor contract
    await hre.run('verify:verify', {
        address: DOCTOR_CONTRACT_ADDRESS,
        constructorArguments: [getDoctorsHexMerkleRoot()],
    });

    // SocialSecurity contract
    await hre.run('verify:verify', {
        address: SOCIALSECURITY_CONTRACT_ADDRESS,
        constructorArguments: [
            NFTXP_BASEURI,
            DOCTOR_CONTRACT_ADDRESS,
            PATIENT_CONTRACT_ADDRESS,
            PHARMACY_CONTRACT_ADDRESS,
        ],
    });

    // Laboratory contract
    await hre.run('verify:verify', {
        address: LABORATORY_CONTRACT_ADDRESS,
        constructorArguments: [NFTXM_BASEURI, PHARMACY_CONTRACT_ADDRESS],
    });

    // Exchanger contract
    await hre.run('verify:verify', {
        address: EXCHANGER_CONTRACT_ADRESS,
        constructorArguments: [LABORATORY_CONTRACT_ADDRESS, PHARMACY_CONTRACT_ADDRESS, PATIENT_CONTRACT_ADDRESS],
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
