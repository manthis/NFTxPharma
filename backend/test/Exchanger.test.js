const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const {
    getDoctorsHexMerkleRoot,
    getDoctorsTreeProof,
    getPatientsHexMerkleRoot,
    getPatientsTreeProof,
    getPharmaciesHexMerkleRoot,
    getPharmaciesTreeProof,
} = require('./whitelists/merkletrees');

describe('Exchanger', function () {
    let laboratoryContract;
    let exchangerContract;

    async function deployContractsFixture() {
        const [owner, ...addrs] = await ethers.getSigners();

        // Laboratory contract
        const LaboratoryContract = await ethers.getContractFactory('Laboratory');
        laboratoryContract = await LaboratoryContract.deploy('ipfs://', getPharmaciesHexMerkleRoot());

        // Exchanger contract
        const ExchangerContract = await ethers.getContractFactory('Exchanger');
        exchangerContract = await ExchangerContract.deploy(
            laboratoryContract.target,
            getPharmaciesHexMerkleRoot(),
            getPatientsHexMerkleRoot(),
        );

        return { contract: exchangerContract, owner, addrs };
    }

    describe('Deployment', function () {
        it('should initialize the contracts addresses properly', async function () {
            const { contract } = await loadFixture(deployContractsFixture);

            expect(await contract.labContractAddress_()).to.equal(laboratoryContract.target);
        });

        it('should have a orderIdCounter set to 0', async function () {
            const { contract } = await loadFixture(deployContractsFixture);
            expect(await contract.orderIdCounter_()).to.equal(0);
        });
    });

    describe('prepareOrder', function () {
        it('should revert if caller is not a valid pharmacy', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];
            const patient = addrs[7];

            await expect(
                contract.prepareOrder(
                    pharmacy,
                    patient,
                    [1, 1],
                    [1, 1],
                    1000,
                    getPharmaciesTreeProof(pharmacy.address),
                ),
            ).to.be.revertedWith('Only pharmacies are allowed to prepare orders!');
        });

        it('should revert if specified pharmacy is not the caller', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy1 = addrs[13];
            const pharmacy2 = addrs[14];
            const patient = addrs[7];

            await expect(
                contract
                    .connect(pharmacy1)
                    .prepareOrder(pharmacy2, patient, [1, 1], [1, 1], 1000, getPharmaciesTreeProof(pharmacy1.address)),
            ).to.be.revertedWith('Provided pharmacy must be the one calling this function!');
        });

        it('should revert if arrays do not have the same lengths', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];
            const patient = addrs[7];

            await expect(
                contract
                    .connect(pharmacy)
                    .prepareOrder(pharmacy, patient, [1, 1], [1], 1000, getPharmaciesTreeProof(pharmacy.address)),
            ).to.be.revertedWith('Arrays should have the same lengths!');
        });

        it('should return an incremented order id', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];
            const patient = addrs[7];
            expect(await contract.orderIdCounter_()).to.equal(0);

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], 10000, getPharmaciesTreeProof(pharmacy.address));

            expect(await contract.orderIdCounter_()).to.equal(1);
        });

        it('should emit an OrderPrepared event', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];

            await expect(
                await contract
                    .connect(pharmacy)
                    .prepareOrder(pharmacy, patient, [1, 1], [1, 1], 10000, getPharmaciesTreeProof(pharmacy.address)),
            )
                .to.emit(contract, 'OrderPrepared')
                .withArgs(1);
        });
    });

    describe('makeOrderReady', function () {
        it('should revert when not called by a valid pharmacy', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];

            await expect(contract.makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address))).to.be.revertedWith(
                'Only pharmacies are allowed to make orders ready!',
            );
        });

        it('should revert if order id does not exist', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];

            await expect(
                contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address)),
            ).to.be.revertedWith('Order does not exist!');
        });

        it('should made the order ready', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];
            const patient = addrs[7];

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], 1000, getPharmaciesTreeProof(pharmacy.address));
            await contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address));

            const isReady = await contract.isOrderReady(1);
            expect(isReady).to.equal(true);
        });

        it('should emit an OrderReady event', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];
            const patient = addrs[7];

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], 1000, getPharmaciesTreeProof(pharmacy.address));
            await expect(contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address)))
                .to.emit(contract, 'OrderReady')
                .withArgs(1);
        });
    });

    describe('isOrderReady', function () {
        it('should revert if orderId does not exist', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);

            const pharmacy = addrs[13];
            const patient = addrs[7];

            await expect(contract.isOrderReady(1)).to.be.revertedWith('Order does not exist!');
        });
    });

    describe('getOrderPrice', function () {
        it('should revert if not called by a valid patient', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];

            await expect(contract.getOrderPrice(1, getPharmaciesTreeProof(pharmacy.address))).to.be.revertedWith(
                'Only patients are allowed to check their order price!',
            );
        });

        it('should revert if order id does not exist', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const patient = addrs[7];

            await expect(
                contract.connect(patient).getOrderPrice(1, getPatientsTreeProof(patient.address)),
            ).to.be.revertedWith('Order does not exist!');
        });

        it('should revert if caller is not the patient of the order', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient1 = addrs[7];

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient1, [1, 1], [1, 1], 10000, getPharmaciesTreeProof(pharmacy.address));

            const patient2 = addrs[8];
            await expect(
                contract.connect(patient2).getOrderPrice(1, getPatientsTreeProof(patient2.address)),
            ).to.be.revertedWith('This order has not been prepared for you!');
        });

        it('should return the total price of the prepared order', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];
            const totalPrice = 1000;

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], totalPrice, getPharmaciesTreeProof(pharmacy.address));

            expect(await contract.connect(patient).getOrderPrice(1, getPatientsTreeProof(patient.address))).to.equal(
                totalPrice,
            );
        });
    });

    describe('payOrder', function () {
        it('should revert if not called by a valid patient', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];

            await expect(contract.payOrder(1, getPharmaciesTreeProof(pharmacy.address))).to.be.revertedWith(
                'Only patients are allowed to check their order price!',
            );
        });

        it('should revert if order id does not exist', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const patient = addrs[7];

            await expect(
                contract.connect(patient).payOrder(1, getPatientsTreeProof(patient.address)),
            ).to.be.revertedWith('Order does not exist!');
        });

        it('should revert if caller is not the patient of the order', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient1 = addrs[7];
            const patient2 = addrs[8];

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient1, [1, 1], [1, 1], 10000, getPharmaciesTreeProof(pharmacy.address));

            await expect(
                contract.connect(patient2).payOrder(1, getPatientsTreeProof(patient2.address)),
            ).to.be.revertedWith('This order has not been prepared for you!');
        });

        it('should revert if order is not ready', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], 10000, getPharmaciesTreeProof(pharmacy.address));

            await expect(
                contract.connect(patient).payOrder(1, getPatientsTreeProof(patient.address)),
            ).to.be.revertedWith('Order must be made ready by pharmacy');
        });

        it('should revert if sent amount does not cover order price', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], 10000, getPharmaciesTreeProof(pharmacy.address));
            await contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address));

            await expect(
                contract.connect(patient).payOrder(1, getPatientsTreeProof(patient.address)),
            ).to.be.revertedWith('Amount of ETH sent must be equal to order total price.');
        });

        it('should revert with a ERC1155MissingApprovalForAll when pharmacy did not approve the contract', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];
            const totalPrice = 10000;

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], totalPrice, getPharmaciesTreeProof(pharmacy.address));
            await contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address));

            await expect(
                contract.connect(patient).payOrder(1, getPatientsTreeProof(patient.address), {
                    value: totalPrice,
                }),
            ).to.be.revertedWithCustomError(laboratoryContract, 'ERC1155MissingApprovalForAll');
        });

        it('should revert with unsufficient balance if the contract Laboratory does not have enough balance', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];
            const totalPrice = 10000;

            await contract
                .connect(pharmacy)
                .prepareOrder(pharmacy, patient, [1, 1], [1, 1], totalPrice, getPharmaciesTreeProof(pharmacy.address));
            await contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address));
            await laboratoryContract.connect(pharmacy).setApprovalForAll(contract.target, true);

            await expect(
                contract.connect(patient).payOrder(1, getPatientsTreeProof(patient.address), {
                    value: totalPrice,
                }),
            ).to.be.revertedWithCustomError(laboratoryContract, 'ERC1155InsufficientBalance');
        });

        it('should transfer the ETH sent by the patient to the pharmacy', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];

            // We setup the contract of the laboratory and provide the pharmacy with NFTxM
            await laboratoryContract.addOrUpdateMedicationData(1, 'test1', 1000, 60);
            await laboratoryContract.addOrUpdateMedicationData(1, 'test2', 6000, 75);
            await laboratoryContract.addOrUpdateMedicationData(1, 'test3', 9000, 60);
            const medicineIds = [1, 2, 3];
            const quantities = [2, 3, 1];
            const totalPrice = await laboratoryContract.calculateTotalPrice(medicineIds, quantities);
            await laboratoryContract
                .connect(pharmacy)
                .mintMedications(medicineIds, quantities, getPharmaciesTreeProof(pharmacy.address), {
                    value: totalPrice,
                });

            // Now the pharmacy has the NFTxM it's time to prepare the order with the Exchanger contract
            await contract
                .connect(pharmacy)
                .prepareOrder(
                    pharmacy,
                    patient,
                    medicineIds,
                    quantities,
                    totalPrice,
                    getPharmaciesTreeProof(pharmacy.address),
                );
            await contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address));

            // We must check that the balance in NFTxM of the pharmacy is correct
            for (let i = 0; i < medicineIds.length; i++) {
                const balance = await laboratoryContract.balanceOf(pharmacy.address, medicineIds[i]);
                expect(balance).to.equal(quantities[i]);
            }

            // We authorize the lab to make the transfer of NFTxM tp the patient in the Laboratory contract
            await laboratoryContract.connect(pharmacy).setApprovalForAll(contract.target, true);

            // We connect to the Exchanger as a patient to pay the order
            await contract.connect(patient).payOrder(1, getPatientsTreeProof(patient.address), {
                value: totalPrice,
            });

            // We deny the lab to make the transfer of NFTxM tp the patient in the Laboratory contract
            await laboratoryContract.connect(pharmacy).setApprovalForAll(contract.target, false);

            // Now we must check the balance of NFTxM of the patient is correct
            for (let i = 0; i < medicineIds.length; i++) {
                const balance = await laboratoryContract.balanceOf(patient.address, medicineIds[i]);
                expect(balance).to.equal(quantities[i]);
            }
        });

        it('should emit a OrderPayed event', async function () {
            const { contract, addrs } = await loadFixture(deployContractsFixture);
            const pharmacy = addrs[13];
            const patient = addrs[7];

            // We setup the contract of the laboratory and provide the pharmacy with NFTxM
            await laboratoryContract.addOrUpdateMedicationData(1, 'test1', 1000, 60);
            await laboratoryContract.addOrUpdateMedicationData(1, 'test2', 6000, 75);
            await laboratoryContract.addOrUpdateMedicationData(1, 'test3', 9000, 60);
            const medicineIds = [1, 2, 3];
            const quantities = [2, 3, 1];
            const totalPrice = await laboratoryContract.calculateTotalPrice(medicineIds, quantities);
            await laboratoryContract
                .connect(pharmacy)
                .mintMedications(medicineIds, quantities, getPharmaciesTreeProof(pharmacy.address), {
                    value: totalPrice,
                });

            // Now the pharmacy has the NFTxM it's time to prepare the order with the Exchanger contract
            await contract
                .connect(pharmacy)
                .prepareOrder(
                    pharmacy,
                    patient,
                    medicineIds,
                    quantities,
                    totalPrice,
                    getPharmaciesTreeProof(pharmacy.address),
                );
            await contract.connect(pharmacy).makeOrderReady(1, getPharmaciesTreeProof(pharmacy.address));

            // We must check that the balance in NFTxM of the pharmacy is correct
            for (let i = 0; i < medicineIds.length; i++) {
                const balance = await laboratoryContract.balanceOf(pharmacy.address, medicineIds[i]);
                expect(balance).to.equal(quantities[i]);
            }

            // We authorize the lab to make the transfer of NFTxM tp the patient in the Laboratory contract
            await laboratoryContract.connect(pharmacy).setApprovalForAll(contract.target, true);

            // We connect to the Exchanger as a patient to pay the order
            await expect(
                contract.connect(patient).payOrder(1, getPatientsTreeProof(patient.address), {
                    value: totalPrice,
                }),
            )
                .to.emit(contract, 'OrderPayed')
                .withArgs(1);
        });
    });
});
