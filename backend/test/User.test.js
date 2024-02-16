const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { getPharmaciesHexMerkleRoot, getPharmaciesTreeProof } = require('./whitelists/merkletrees');

describe('User', function () {
    async function deployContractFixture() {
        const [owner, ...addrs] = await ethers.getSigners();
        const User = await ethers.getContractFactory('User');

        const user = await User.deploy(getPharmaciesHexMerkleRoot());

        return { contract: user, owner, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner set', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);
            expect(await contract.owner()).to.equal(owner.address);
        });

        it('should have initialized the merkle root', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            expect(await contract.hexMerkleRoot_()).to.equal(getPharmaciesHexMerkleRoot());
        });
    });

    describe('Setters', function () {
        it('should set the merkle root', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            await contract.setMerkleRoot('0x0000000000000000000000000000000000000000000000000000000000000001');
            expect(await contract.hexMerkleRoot_()).to.equal(
                '0x0000000000000000000000000000000000000000000000000000000000000001',
            );
        });

        it('should emit a UpdateMerkleRoot event', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            await expect(contract.setMerkleRoot('0x0000000000000000000000000000000000000000000000000000000000000001'))
                .to.emit(contract, 'UpdatedMerkleRoot')
                .withArgs('0x0000000000000000000000000000000000000000000000000000000000000001');
        });
    });

    describe('isUserWhitelisted', function () {
        it('should return true if user is whitelisted', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            expect(await contract._isUser(addrs[13], getPharmaciesTreeProof(addrs[13].address))).to.equal(true);
        });
    });
});
