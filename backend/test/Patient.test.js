const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { getPatientsHexMerkleRoot, getPatientsTreeProof } = require('./whitelists/merkletrees');

describe('Patient', function () {
    async function deployContractFixture() {
        const [owner, ...addrs] = await ethers.getSigners();
        const Patient = await ethers.getContractFactory('Patient');

        const patient = await Patient.deploy(getPatientsHexMerkleRoot());

        return { patient, owner, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner set', async function () {
            const { patient, owner } = await loadFixture(deployContractFixture);
            expect(await patient.owner()).to.equal(owner.address);
        });

        it('should have its merkleroot initialized', async function () {
            const { patient } = await loadFixture(deployContractFixture);
            expect(await patient.patientsHexMerkleRoot_()).to.equal(getPatientsHexMerkleRoot());
        });
    });

    describe('Setters', function () {
        it('should set merkle root as admin', async function () {
            const { patient } = await loadFixture(deployContractFixture);
            const newRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
            await patient.setPatientsMerkleRoot(newRoot);
            expect(await patient.patientsHexMerkleRoot_()).to.equal(newRoot);
        });

        it('should not set the merkle root if not an admin', async function () {
            const { patient, addrs } = await loadFixture(deployContractFixture);
            const newRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
            expect(patient.connect(addrs[10]).setPatientsMerkleRoot(newRoot))
                .to.be.revertedWithCustomError(patient, 'OwnableUnauthorizedAccount')
                .withArgs(addrs[10].address);
        });
    });

    describe('Authorization', function () {
        it('should authorize a valid patient', async function () {
            const { patient, addrs } = await loadFixture(deployContractFixture);
            expect(await patient.isPatient(addrs[10].address, getPatientsTreeProof(addrs[10].address))).to.equal(true);
        });

        it('should deny an invalid patient', async function () {
            const { patient, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[addrs.length - 1]; // We use the last hardhat address which does not belong to any group
            expect(await patient.isPatient(addr.address, getPatientsTreeProof(addr.address))).to.equal(false);
        });
    });
});
