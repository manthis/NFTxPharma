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
const { NFTXP_BASEURI, NFTXM_BASEURI } = require('../scripts/constants');

async function main() {
    console.log('Deploying contracts...');

    // Patient smart contract
    const PatientContract = await hre.ethers.getContractFactory('Patient');
    const patientContract = await PatientContract.deploy(getPatientsHexMerkleRoot());
    await patientContract.waitForDeployment();
    console.log('Patient contract deployed to:', patientContract.target);

    // Pharmacy smart contract
    const PharmacyContract = await hre.ethers.getContractFactory('Pharmacy');
    const pharmacyContract = await PharmacyContract.deploy(getPharmaciesHexMerkleRoot());
    await pharmacyContract.waitForDeployment();
    console.log('Pharmacy contract deployed to:', pharmacyContract.target);

    // Doctor smart contract
    const DoctorContract = await hre.ethers.getContractFactory('Doctor');
    const doctorContract = await DoctorContract.deploy(getDoctorsHexMerkleRoot());
    await doctorContract.waitForDeployment();
    console.log('Doctor contract deployed to:', doctorContract.target);

    // SocialSecurity Smart Contract
    const SocialSecurityContract = await hre.ethers.getContractFactory('SocialSecurity');
    const socialSecurityContract = await SocialSecurityContract.deploy(
        NFTXP_BASEURI,
        doctorContract.target,
        patientContract.target,
        pharmacyContract.target,
    );
    await socialSecurityContract.waitForDeployment();
    console.log('SocialSecurity contract deployed to:', socialSecurityContract.target);

    // Laboratory smart contract
    const LaboratoryContract = await ethers.getContractFactory('Laboratory');
    const laboratoryContract = await LaboratoryContract.deploy(NFTXM_BASEURI, pharmacyContract.target);
    laboratoryContract.waitForDeployment();
    console.log('Laboratory contract deployed to:', laboratoryContract.target);

    console.log('Initializing laboratory medication listing...');
    const medicationList = getMedicationArrays();
    let id, price, rate;
    let medicationListLength = medicationList.length;
    console.log(`Medication listing initialization: ${medicationListLength} medications to be added!`);
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
        pharmacyContract.target,
        patientContract.target,
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
