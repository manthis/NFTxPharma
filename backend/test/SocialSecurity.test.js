const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect, assert } = require('chai');
const {
    getDoctorsHexMerkleRoot,
    getDoctorsTreeProof,
    getPatientsHexMerkleRoot,
    getPatientsTreeProof,
    getPharmaciesHexMerkleRoot,
    getPharmaciesTreeProof,
} = require('./whitelists/merkletrees');

describe('SocialSecurity', function () {
    async function deployContractFixture() {
        const [owner, ...addrs] = await ethers.getSigners();
        const SocialSecurityContract = await ethers.getContractFactory('SocialSecurity');
        const socialSecurityContract = await SocialSecurityContract.deploy(
            'ipfs://QmV9w4bXjS5k5JLs5mZ6q2sQwqNqZc2y4HnF7f4b7v4b7/',
            getDoctorsHexMerkleRoot(),
            getPatientsHexMerkleRoot(),
            getPharmaciesHexMerkleRoot(),
        );

        return { contract: socialSecurityContract, owner, addrs };
    }

    describe('Deployment', function () {
        it('should have the correct owner set', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);
            expect(await contract.owner()).to.equal(owner.address);
        });
    });

    describe('mintPrescription', function () {
        it('should revert when not called by a doctor', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);
            try {
                await contract.mintPrescription(
                    addrs[7].address,
                    getDoctorsTreeProof(owner.address),
                    getPatientsTreeProof(addrs[7].address),
                );
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Only doctors are allowed to mint prescriptions!');
            }
        });

        it('should pass when called by a doctor', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);
            try {
                await contract
                    .connect(addrs[1])
                    .mintPrescription(
                        addrs[7].address,
                        getDoctorsTreeProof(addrs[1].address),
                        getPatientsTreeProof(addrs[7].address),
                    );
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Transaction did not revert');
            }
        });

        it('should fail if "to" is not a patient', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);
            try {
                await contract
                    .connect(addrs[1])
                    .mintPrescription(
                        owner.address,
                        getDoctorsTreeProof(addrs[1].address),
                        getPatientsTreeProof(owner.address),
                    );
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Only patients can receive prescriptions!');
            }
        });

        it('should provide with consecutive tokenIds', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);

            expect(await contract.tokenId_()).to.equal(0);

            await contract
                .connect(addrs[1])
                .mintPrescription(
                    addrs[7].address,
                    getDoctorsTreeProof(addrs[1].address),
                    getPatientsTreeProof(addrs[7].address),
                );
            expect(await contract.tokenId_()).to.equal(1);

            await contract
                .connect(addrs[1])
                .mintPrescription(
                    addrs[7].address,
                    getDoctorsTreeProof(addrs[1].address),
                    getPatientsTreeProof(addrs[7].address),
                );
            expect(await contract.tokenId_()).to.equal(2);
        });

        it('should send the Prescription NFT to the patient', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);

            const doctor = addrs[1];
            const patient = addrs[7];

            await contract
                .connect(doctor)
                .mintPrescription(
                    patient.address,
                    getDoctorsTreeProof(doctor.address),
                    getPatientsTreeProof(patient.address),
                );

            expect(await contract.ownerOf(0)).to.equal(patient.address);
        });
    });

    describe('transferToPharmacy', function () {
        it('should be forbidden for a non patient', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);

            const doctor = addrs[1];
            const patient = addrs[7];

            await contract
                .connect(doctor)
                .mintPrescription(
                    patient.address,
                    getDoctorsTreeProof(doctor.address),
                    getPatientsTreeProof(patient.address),
                );

            try {
                await contract.transferToPharmacy(
                    getPatientsTreeProof(patient.address),
                    doctor.address,
                    getPharmaciesTreeProof(doctor.address),
                    0,
                );
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Only patients can transfer prescriptions!');
            }
        });

        it('should not be able to transfer to 0x0 address', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);

            const doctor = addrs[1];
            const patient = addrs[7];
            const addressZero = '0x0000000000000000000000000000000000000000';

            await contract
                .connect(doctor)
                .mintPrescription(
                    patient.address,
                    getDoctorsTreeProof(doctor.address),
                    getPatientsTreeProof(patient.address),
                );

            expect(
                contract
                    .connect(patient)
                    .transferToPharmacy(
                        getPatientsTreeProof(patient.address),
                        addressZero,
                        getPharmaciesTreeProof(addressZero),
                        0,
                    ),
            )
                .to.be.revertedWithCustomError(contract, 'ERC721InvalidReceiver')
                .withArgs('0x0000000000000000000000000000000000000000');
        });

        it('should only be able to transfer to a pharmacy', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);

            const doctor = addrs[1];
            const patient = addrs[7];
            const addressZero = '0x0000000000000000000000000000000000000000';

            await contract
                .connect(doctor)
                .mintPrescription(
                    patient.address,
                    getDoctorsTreeProof(doctor.address),
                    getPatientsTreeProof(patient.address),
                );

            try {
                await contract
                    .connect(patient)
                    .transferToPharmacy(
                        getPatientsTreeProof(patient.address),
                        owner.address,
                        getPharmaciesTreeProof(owner.address),
                        0,
                    );
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Patients can only transfer presciptions to pharmacies!');
            }
        });

        it('should not revert when transferring from a patient to a pharmacy', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);

            const doctor = addrs[1];
            const patient = addrs[7];
            const pharmacy = addrs[13];

            await contract
                .connect(doctor)
                .mintPrescription(
                    patient.address,
                    getDoctorsTreeProof(doctor.address),
                    getPatientsTreeProof(patient.address),
                );

            try {
                await contract
                    .connect(patient)
                    .transferToPharmacy(
                        getPatientsTreeProof(patient.address),
                        pharmacy,
                        getPharmaciesTreeProof(pharmacy.address),
                        0,
                    );
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Transaction did not revert');
            }
        });

        it('should have transferred the prescription to the pharmacy', async function () {
            const { contract, owner, addrs } = await loadFixture(deployContractFixture);

            const doctor = addrs[1];
            const patient = addrs[7];
            const pharmacy = addrs[13];

            await contract
                .connect(doctor)
                .mintPrescription(
                    patient.address,
                    getDoctorsTreeProof(doctor.address),
                    getPatientsTreeProof(patient.address),
                );

            await contract
                .connect(patient)
                .transferToPharmacy(
                    getPatientsTreeProof(patient.address),
                    pharmacy,
                    getPharmaciesTreeProof(pharmacy.address),
                    0,
                );

            expect(await contract.ownerOf(0)).to.equal(pharmacy.address);
        });
    });

    describe('tokenURI', function () {
        it('should revert if token does not exist', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            try {
                await contract.tokenURI(0);
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Token does not exist!');
            }
        });

        it('should return the correct tokenURI for a provided existing tokenId', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            await contract
                .connect(addrs[1])
                .mintPrescription(
                    addrs[7].address,
                    getDoctorsTreeProof(addrs[1].address),
                    getPatientsTreeProof(addrs[7].address),
                );
            expect(await contract.tokenURI(0)).to.equal('ipfs://QmV9w4bXjS5k5JLs5mZ6q2sQwqNqZc2y4HnF7f4b7v4b7/0.json');
        });
    });

    describe('BaseURI', function () {
        it('should have a BaseURI set on initialization', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            expect(await contract.getBaseURI()).to.equal('ipfs://QmV9w4bXjS5k5JLs5mZ6q2sQwqNqZc2y4HnF7f4b7v4b7/');
        });

        it('should be set when done by admin', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            expect(contract.setBaseURI('URI')).to.not.be.reverted;
        });

        it('should revert when set by a non admin', async function () {
            const { contract, addrs } = await loadFixture(deployContractFixture);
            expect(contract.connect(addrs[10]).setBaseURI('URI'))
                .to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount')
                .withArgs(addrs[10].address);
        });
    });

    describe('supportsInterface', function () {
        it('should support interface', async function () {
            const { contract } = await loadFixture(deployContractFixture);
            expect(await contract.supportsInterface('0x01ffc9a7')).to.equal(true);
            expect(await contract.supportsInterface('0xffffffff')).to.equal(false);
        });
    });

    describe('ERC721 disabled features', function () {
        it('should revert when calling "approve"', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);

            try {
                // TODO NE FONCTIONNE PAS: le teste passe quelque soit le message
                // expect(prescriptions.approve(owner.address, 1)).to.be.revertedWith('Not implemented in Prescriptions');

                // FIX
                // Exécuter la transaction qui devrait échouer
                await contract.approve(owner.address, 1);
                // Forcer l'échec du test si la transaction ne revert pas
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Not implemented in Prescriptions');
            }
        });

        it('should revert when calling "getApproved"', async function () {
            const { contract } = await loadFixture(deployContractFixture);

            try {
                await contract.getApproved(1);
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Not implemented in Prescriptions');
            }
        });

        it('should revert when calling "setApprovalForAll"', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);

            try {
                await contract.setApprovalForAll(owner.address, 1);
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Not implemented in Prescriptions');
            }
        });

        it('should revert when calling "isApprovedForAll"', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);

            try {
                await contract.isApprovedForAll(owner.address, owner.address);
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Not implemented in Prescriptions');
            }
        });

        it('should revert when calling "transferFrom"', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);

            try {
                await contract.transferFrom(owner.address, owner.address, 1);
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Not implemented in Prescriptions');
            }
        });

        it('should revert when calling "safeTransferFrom"', async function () {
            const { contract, owner } = await loadFixture(deployContractFixture);

            try {
                await contract.safeTransferFrom(owner.address, owner.address, 1);
                assert.fail('Transaction did not revert');
            } catch (error) {
                assert.include(error.message, 'Not implemented in Prescriptions');
            }
        });
    });
});
