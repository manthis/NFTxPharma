const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const { getPharmaciesHexMerkleRoot, getPharmaciesTreeProof } = require('./whitelists/merkletrees');

describe('Laboratory', function () {
    async function deployContractFixture() {
        const [owner, ...addrs] = await ethers.getSigners();

        // Pharmacy contract
        const PharmacyContract = await ethers.getContractFactory('Pharmacy');
        const pharmacyContract = await PharmacyContract.deploy(getPharmaciesHexMerkleRoot());

        // Laboratory contract
        const LaboratoryContract = await ethers.getContractFactory('Laboratory');
        const laboratoryContract = await LaboratoryContract.deploy('ipfs://', pharmacyContract.target);

        return { contract: laboratoryContract, owner, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner set', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);
            expect(await contract.owner()).to.equal(owner.address);
        });
    });

    describe('setPharmacyContractAddress', function () {
        it('should revert when not called by the admin', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            expect(contract.connect(addrs[1]).setPharmacyContractAddress(addrs[1].address))
                .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')
                .withArgs(addrs[1].address);
        });

        it('should set the pharmacy contract address when called by the admin', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await expect(contract.setPharmacyContractAddress(addrs[1].address)).not.to.be.reverted;
        });

        it('should emit a PharmacyContractAddressSet event when called by the admin', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await expect(contract.setPharmacyContractAddress(addrs[1].address))
                .to.emit(contract, 'PharmacyContractAddressSet')
                .withArgs(addrs[1].address);
        });
    });

    describe('addOrUpdateMedicationData and getMedicationData', function () {
        it('should revert when not called by admin', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            expect(contract.connect(addrs[1]).addOrUpdateMedicationData(1, 'test', 1, 60))
                .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')
                .withArgs(addrs[1].address);
        });

        it('should set the mapping when called by admin', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await expect(contract.addOrUpdateMedicationData(1, 'test', 1, 60)).not.to.be.reverted;
            const result = await contract.getMedicationData(1);
            expect(result[0]).to.equal('test');
            expect(result[1]).to.equal(1);
            expect(result[2]).to.equal(60);
        });

        it('should emit a MedicationDataUpdated event', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await expect(contract.addOrUpdateMedicationData(1, 'test', 1, 60))
                .to.emit(contract, 'MedicationDataUpdated')
                .withArgs(1, 'test', 1, 60);
        });
    });

    describe('calculateTotalPrice', function () {
        it('should return the correct price', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            await contract.addOrUpdateMedicationData(1, 'test1', 1, 60);
            await contract.addOrUpdateMedicationData(2, 'test2', 6, 75);
            await contract.addOrUpdateMedicationData(3, 'test3', 9, 60);

            expect(await contract.calculateTotalPrice([1, 2, 3], [1, 2, 3])).to.equal(40);
        });

        it('should return the correct price with invalid Ids', async function () {
            const { contract } = await loadFixture(deployContractFixture);

            expect(await contract.calculateTotalPrice([1, 1, 1], [1, 1, 1])).to.equal(0);
        });

        it('should revert if provided arrays have different length', async function () {
            const { contract } = await loadFixture(deployContractFixture);

            await expect(contract.calculateTotalPrice([1, 1, 1], [1, 1])).to.be.revertedWith(
                'Arrays should have the same lengths!',
            );
        });
    });

    describe('mintMedications', function () {
        it('should revert when not called by admin', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            const pharmacy = addrs[13];
            expect(
                contract
                    .connect(addrs[1])
                    .mintMedications([1, 1, 1], [1, 1, 1], getPharmaciesTreeProof(pharmacy.address)),
            )
                .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')
                .withArgs(addrs[1].address);
        });

        it('should revert when balance is unsufficient', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await contract.addOrUpdateMedicationData(1, 'test1', 1000, 60);
            await contract.addOrUpdateMedicationData(2, 'test2', 6000, 75);
            await contract.addOrUpdateMedicationData(3, 'test3', 9000, 60);
            const pharmacy = addrs[13];
            await expect(
                contract
                    .connect(pharmacy)
                    .mintMedications([1, 2, 3], [1, 2, 3], getPharmaciesTreeProof(pharmacy.address)),
            ).to.be.revertedWith('Unsufficient balance!');
        });

        it('should not revert when balance is sufficient', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await contract.addOrUpdateMedicationData(1, 'test1', 1000, 60);
            await contract.addOrUpdateMedicationData(2, 'test2', 6000, 75);
            await contract.addOrUpdateMedicationData(3, 'test3', 9000, 60);
            const pharmacy = addrs[13];

            const medicineIds = [1, 2, 3];
            const quantities = [1, 2, 3];

            const totalPrice = await contract.calculateTotalPrice(medicineIds, quantities);
            await expect(
                contract
                    .connect(pharmacy)
                    .mintMedications(medicineIds, quantities, getPharmaciesTreeProof(pharmacy.address), {
                        value: totalPrice,
                    }),
            ).not.to.be.reverted;
        });

        it('should transfer appropriate NFTxMs to the pharmacy', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await contract.addOrUpdateMedicationData(1, 'test1', 1000, 60);
            await contract.addOrUpdateMedicationData(2, 'test2', 6000, 75);
            await contract.addOrUpdateMedicationData(3, 'test3', 9000, 60);
            const pharmacy = addrs[13];

            const medicineIds = [1, 2, 3];
            const quantities = [1, 2, 3];

            const totalPrice = await contract.calculateTotalPrice(medicineIds, quantities);
            await contract
                .connect(pharmacy)
                .mintMedications(medicineIds, quantities, getPharmaciesTreeProof(pharmacy.address), {
                    value: totalPrice,
                });

            for (let i = 0; i < medicineIds.length; i++) {
                const balance = await contract.balanceOf(pharmacy.address, medicineIds[i]);
                expect(balance).to.equal(quantities[i]);
            }
        });

        it('Should refund excess payment', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);

            await contract.addOrUpdateMedicationData(1, 'test1', 1, 60);
            await contract.addOrUpdateMedicationData(2, 'test2', 6, 75);
            await contract.addOrUpdateMedicationData(3, 'test3', 9, 60);

            const medicineIds = [1, 2, 3];
            const quantities = [1, 2, 3];

            const totalPriceInWei = await contract.calculateTotalPrice(medicineIds, quantities); // We compute the total price in WEI of the NFT generation
            const excessAmountInWei = totalPriceInWei + ethers.parseEther('1'); // We now make an excessive payment we should be reimbursed

            const pharmacy = addrs[13];
            const balanceBeforeInWei = await ethers.provider.getBalance(pharmacy.address);

            // Call of the minting function with an excess payment
            const tx = await contract
                .connect(pharmacy)
                .mintMedications(medicineIds, quantities, getPharmaciesTreeProof(pharmacy.address), {
                    value: excessAmountInWei,
                });
            const receipt = await tx.wait();

            const balanceAfterInWei = await ethers.provider.getBalance(pharmacy.address);
            const gasUsedBN = BigInt(receipt.gasUsed); // We get the gas used during transaction
            const gasPriceBN = BigInt(await tx.gasPrice); // We get the gas price during transaction
            const estimatedGasCost = gasUsedBN * gasPriceBN;
            const expectedBalanceInWei =
                balanceBeforeInWei - excessAmountInWei + (excessAmountInWei - (totalPriceInWei + estimatedGasCost));

            expect(balanceAfterInWei).to.equal(expectedBalanceInWei); // Ensure excess payment was refunded
        });

        it('should emit a MedicationMinted event', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await contract.addOrUpdateMedicationData(1, 'test1', 1000, 60);
            await contract.addOrUpdateMedicationData(2, 'test2', 6000, 75);
            await contract.addOrUpdateMedicationData(3, 'test3', 9000, 60);
            const pharmacy = addrs[13];

            const medicineIds = [1, 2, 3];
            const quantities = [1, 2, 3];

            const totalPrice = await contract.calculateTotalPrice(medicineIds, quantities);
            await expect(
                contract
                    .connect(pharmacy)
                    .mintMedications(medicineIds, quantities, getPharmaciesTreeProof(pharmacy.address), {
                        value: totalPrice,
                    }),
            )
                .to.emit(contract, 'MedicationMinted')
                .withArgs(totalPrice, pharmacy.address);
        });
    });
});
