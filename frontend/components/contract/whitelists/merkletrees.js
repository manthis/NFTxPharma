import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import doctorsWhitelist from './doctors.json';
import patientsWhitelist from './patients.json';
import pharmaciesWhitelist from './pharmacies.json';

const _buildMerkleTreeFromArray = (_arrayOfAddresses) => {
    const leaves = _arrayOfAddresses.map((address) => {
        return keccak256(address);
    });
    return new MerkleTree(leaves, keccak256, { sort: true });
};

const buildDoctorsMerkleTree = () => {
    return _buildMerkleTreeFromArray(doctorsWhitelist.map((doctor) => doctor.address));
};

const buildPatientsMerkleTree = () => {
    return _buildMerkleTreeFromArray(patientsWhitelist.map((patient) => patient.address));
};

const buildPharmaciesMerkleTree = () => {
    return _buildMerkleTreeFromArray(pharmaciesWhitelist.map((pharmacy) => pharmacy.address));
};

export const getDoctorsHexMerkleRoot = () => {
    return buildDoctorsMerkleTree().getHexRoot();
};

export const getPatientsHexMerkleRoot = () => {
    return buildPatientsMerkleTree().getHexRoot();
};

export const getPharmaciesHexMerkleRoot = () => {
    return buildPharmaciesMerkleTree().getHexRoot();
};

export const getDoctorsTreeProof = (address) => {
    return buildDoctorsMerkleTree().getHexProof(keccak256(address));
};

export const getPatientsTreeProof = (address) => {
    return buildPatientsMerkleTree().getHexProof(keccak256(address));
};

export const getPharmaciesTreeProof = (address) => {
    return buildPharmaciesMerkleTree().getHexProof(keccak256(address));
};

export const getDoctorsAddressList = () => {
    return doctorsWhitelist.map((doctor) => doctor.address);
};

export const getPatientsAddressList = () => {
    return patientsWhitelist.map((patient) => patient.address);
};

export const getPharmaciesAddressList = () => {
    return pharmaciesWhitelist.map((pharmacy) => pharmacy.address);
};
