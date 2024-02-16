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
const { getMedicationArrays } = require('../test/medications/medications');

async function main() {
    const NFTXP_BASEURI = 'ipfs://QmV9w4bXjS5k5JLs5mZ6q2sQwqNqZc2y4HnF7f4b7v4b7/'; // TODO to be edited
    const NFTXM_BASEURI = 'ipfs://'; // TODO to be edited

    // SocialSecurity Smart Contract
    const SocialSecurityContract = await hre.ethers.getContractFactory('SocialSecurity');
    const socialSecurityContract = await SocialSecurityContract.deploy(
        NFTXP_BASEURI,
        getDoctorsHexMerkleRoot(),
        getPatientsHexMerkleRoot(),
        getPharmaciesHexMerkleRoot(),
    );
    await socialSecurityContract.waitForDeployment();
    console.log('SocialSecurity contract deployed to:', socialSecurityContract.target);

    // Laboratory smart contract
    const LaboratoryContract = await ethers.getContractFactory('Laboratory');
    const laboratoryContract = await LaboratoryContract.deploy(NFTXM_BASEURI, getPharmaciesHexMerkleRoot());
    laboratoryContract.waitForDeployment();
    console.log('Laboratory contract deployed to:', laboratoryContract.target);

    console.log('Initializing laboratory medication listing...');
    const medicationList = getMedicationArrays();
    let id, price, rate;
    let medicationListLength = medicationList.length;
    for (let i = 0; i < medicationListLength; i++) {
        id = medicationList[i].id;
        name = medicationList[i].name;
        price = medicationList[i].price;
        rate = medicationList[i].rate;
        await laboratoryContract.addOrUpdateMedicationData(id, name, price, rate);
    }
    console.log(`Medication listing initialization done: ${medicationListLength} medications added!`);

    // Exchanger smart contract
    const ExchangerContract = await ethers.getContractFactory('Exchanger');
    const exchangerContract = await ExchangerContract.deploy(
        laboratoryContract.target,
        getPharmaciesHexMerkleRoot(),
        getPatientsHexMerkleRoot(),
    );
    exchangerContract.waitForDeployment();
    console.log('Exchanger contract deployed to:', exchangerContract.target);

    console.log('All contracts deployed and ready.');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
