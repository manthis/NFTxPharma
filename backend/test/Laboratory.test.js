const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');

describe('Laboratory', function () {
    async function deployContractFixture() {
        const [owner, ...addrs] = await ethers.getSigners();
        const LaboratoryContract = await ethers.getContractFactory('Laboratory');
        const laboratoryContract = await LaboratoryContract.deploy();

        return { contract: laboratoryContract, owner, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner set', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);
            expect(await contract.owner()).to.equal(owner.address);
        });
    });
});
