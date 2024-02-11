const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const {
    getDoctorsHexMerkleRoot,
    getPatientsHexMerkleRoot,
    getPharmaciesHexMerkleRoot,
    getDoctorsTreeProof,
    getPatientsTreeProof,
    getPharmaciesTreeProof,
} = require('./merkletrees.js');

describe('AuthorizationManager', function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployContractFixture() {
        const [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        const AuthorizationManager = await ethers.getContractFactory('AuthorizationManager');

        const authorizationManager = await AuthorizationManager.deploy(
            getDoctorsHexMerkleRoot(),
            getPatientsHexMerkleRoot(),
            getPharmaciesHexMerkleRoot(),
        );

        return { authorizationManager, owner, addr1, addr2, addr3, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner', async function () {
            const { authorizationManager, owner } = await loadFixture(deployContractFixture);
            expect(await authorizationManager.owner()).to.equal(owner.address);
        });

        it('should have merkle roots initialized', async function () {
            const { authorizationManager } = await loadFixture(deployContractFixture);
            expect(await authorizationManager.doctorsMerkleRoot()).to.equal(getDoctorsHexMerkleRoot());
            expect(await authorizationManager.patientsMerkleRoot()).to.equal(getPatientsHexMerkleRoot());
            expect(await authorizationManager.pharmaciesMerkleRoot()).to.equal(getPharmaciesHexMerkleRoot());
        });
    });

    describe('Setters', function () {
        it('should set merkle roots', async function () {
            const { authorizationManager } = await loadFixture(deployContractFixture);
            const newRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';

            await authorizationManager.setDoctorsMerkleRoot(newRoot);
            await authorizationManager.setPatientsMerkleRoot(newRoot);
            await authorizationManager.setPharmaciesMerkleRoot(newRoot);

            expect(await authorizationManager.doctorsMerkleRoot()).to.equal(newRoot);
            expect(await authorizationManager.patientsMerkleRoot()).to.equal(newRoot);
            expect(await authorizationManager.pharmaciesMerkleRoot()).to.equal(newRoot);
        });
    });

    describe('Authorization', function () {
        it('should authorize a valid doctor', async function () {
            const { authorizationManager, addr1 } = await loadFixture(deployContractFixture);
            expect(await authorizationManager.isDoctor(addr1.address, getDoctorsTreeProof(addr1.address))).to.equal(
                true,
            );
        });

        it('should deny an invalid doctor', async function () {
            const { authorizationManager, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[addrs.length - 1]; // We use the last hardhat address which does not belong to any group
            expect(await authorizationManager.isDoctor(addr.address, getDoctorsTreeProof(addr.address))).to.equal(
                false,
            );
        });

        it('should authorize a valid patient', async function () {
            const { authorizationManager, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[3]; // We use the first patient address (see patients.json)
            expect(await authorizationManager.isPatient(addr.address, getPatientsTreeProof(addr.address))).to.equal(
                true,
            );
        });

        it('should deny an invalid patient', async function () {
            const { authorizationManager, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[addrs.length - 1]; // We use the last hardhat address which does not belong to any group
            expect(await authorizationManager.isPatient(addr.address, getPatientsTreeProof(addr.address))).to.equal(
                false,
            );
        });

        it('should authorize a valid pharmacy', async function () {
            const { authorizationManager, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[10]; // We use the first pharmacy address (see pharmacies.json)
            expect(await authorizationManager.isPharmacy(addr.address, getPharmaciesTreeProof(addr.address))).to.equal(
                true,
            );
        });

        it('should deny an invalid pharmacy', async function () {
            const { authorizationManager, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[addrs.length - 1]; // We use the last hardhat address which does not belong to any group
            expect(await authorizationManager.isPharmacy(addr.address, getPharmaciesTreeProof(addr.address))).to.equal(
                false,
            );
        });
    });
});
