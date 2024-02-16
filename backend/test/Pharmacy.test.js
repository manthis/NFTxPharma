const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { getPharmaciesHexMerkleRoot, getPharmaciesTreeProof } = require('./whitelists/merkletrees');

describe('Pharmacy', function () {
    async function deployContractFixture() {
        const [owner, ...addrs] = await ethers.getSigners();
        const Pharmarcy = await ethers.getContractFactory('Pharmacy');

        const pharmacy = await Pharmarcy.deploy(getPharmaciesHexMerkleRoot());

        return { pharmacy, owner, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner set', async function () {
            const { pharmacy, owner } = await loadFixture(deployContractFixture);
            expect(await pharmacy.owner()).to.equal(owner.address);
        });

        it('should have its merkleroot initialized', async function () {
            const { pharmacy } = await loadFixture(deployContractFixture);
            expect(await pharmacy.hexMerkleRoot_()).to.equal(getPharmaciesHexMerkleRoot());
        });
    });

    describe('Setters', function () {
        it('should set merkle root as admin', async function () {
            const { pharmacy } = await loadFixture(deployContractFixture);
            const newRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
            await pharmacy.setMerkleRoot(newRoot);
            expect(await pharmacy.hexMerkleRoot_()).to.equal(newRoot);
        });

        it('should not set the merkle root if not an admin', async function () {
            const { pharmacy, addrs } = await loadFixture(deployContractFixture);
            const newRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
            expect(pharmacy.connect(addrs[10]).setMerkleRoot(newRoot))
                .to.be.revertedWithCustomError(pharmacy, 'OwnableUnauthorizedAccount')
                .withArgs(addrs[10].address);
        });
    });

    describe('Authorization', function () {
        it('should authorize a valid pharmacy', async function () {
            const { pharmacy, addrs } = await loadFixture(deployContractFixture);
            expect(await pharmacy.isPharmacy(addrs[13].address, getPharmaciesTreeProof(addrs[13].address))).to.equal(
                true,
            );
        });

        it('should deny an invalid pharmacy', async function () {
            const { pharmacy, addrs } = await loadFixture(deployContractFixture);
            const addr = addrs[addrs.length - 1]; // We use the last hardhat address which does not belong to any group
            expect(await pharmacy.isPharmacy(addr.address, getPharmaciesTreeProof(addr.address))).to.equal(false);
        });
    });
});
