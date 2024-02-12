const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { getDoctorsHexMerkleRoot, getDoctorsTreeProof } = require('./merkletrees');

describe('Doctor', function () {
    async function deployContractFixture() {
        const [owner, ...addrs] = await ethers.getSigners();
        const Doctor = await ethers.getContractFactory('Doctor');

        const doctor = await Doctor.deploy(getDoctorsHexMerkleRoot());

        return { doctor, owner, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner set', async function () {
            const { doctor, owner } = await loadFixture(deployContractFixture);
            expect(await doctor.owner()).to.equal(owner.address);
        });

        it('should have its merkleroot initialized', async function () {
            const { doctor } = await loadFixture(deployContractFixture);
            expect(await doctor.merkleRoot()).to.equal(getDoctorsHexMerkleRoot());
        });
    });

    describe('Setters', function () {
        it('should set merkle root as admin', async function () {
            const { doctor } = await loadFixture(deployContractFixture);
            const newRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
            await doctor.setMerkleRoot(newRoot);
            expect(await doctor.merkleRoot()).to.equal(newRoot);
        });

        it('should not set the merkle root if not an admin', async function () {
            const { doctor, addrs } = await loadFixture(deployContractFixture);
            const newRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
            expect(doctor.connect(addrs[10]).setMerkleRoot(newRoot))
                .to.be.revertedWithCustomError(doctor, 'OwnableUnauthorizedAccount')
                .withArgs(addrs[10].address);
        });
    });

    describe('Authorization', function () {
        it('should authorize a valid doctor', async function () {
            const { doctor, addrs } = await loadFixture(deployContractFixture);
            expect(await doctor.isWhitelisted(addrs[1].address, getDoctorsTreeProof(addrs[1].address))).to.equal(true);
        });

        it('should deny an invalid doctor', async function () {
            const { doctor, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[addrs.length - 1]; // We use the last hardhat address which does not belong to any group
            expect(await doctor.isWhitelisted(addr.address, getDoctorsTreeProof(addr.address))).to.equal(false);
        });
    });
});
