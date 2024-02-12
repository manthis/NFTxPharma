const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const doctorsWhitelist = require('./doctors.json');
const patientsWhitelist = require('./patients.json');
const pharmaciesWhitelist = require('./pharmacies.json');

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

const getDoctorsHexMerkleRoot = () => {
    return buildDoctorsMerkleTree().getHexRoot();
};

const getPatientsHexMerkleRoot = () => {
    return buildPatientsMerkleTree().getHexRoot();
};

const getPharmaciesHexMerkleRoot = () => {
    return buildPharmaciesMerkleTree().getHexRoot();
};

const getDoctorsTreeProof = (address) => {
    return buildDoctorsMerkleTree().getHexProof(keccak256(address));
};

const getPatientsTreeProof = (address) => {
    return buildPatientsMerkleTree().getHexProof(keccak256(address));
};

const getPharmaciesTreeProof = (address) => {
    return buildPharmaciesMerkleTree().getHexProof(keccak256(address));
};

const getDoctorsAddressList = () => {
    return doctorsWhitelist.map((doctor) => doctor.address);
};

const getPatientsAddressList = () => {
    return patientsWhitelist.map((patient) => patient.address);
};

const getPharmaciesAddressList = () => {
    return pharmaciesWhitelist.map((pharmacy) => pharmacy.address);
};

exports.getDoctorsHexMerkleRoot = getDoctorsHexMerkleRoot;
exports.getPatientsHexMerkleRoot = getPatientsHexMerkleRoot;
exports.getPharmaciesHexMerkleRoot = getPharmaciesHexMerkleRoot;
exports.getDoctorsTreeProof = getDoctorsTreeProof;
exports.getPatientsTreeProof = getPatientsTreeProof;
exports.getPharmaciesTreeProof = getPharmaciesTreeProof;
exports.buildDoctorsMerkleTree = buildDoctorsMerkleTree;
exports.buildPatientsMerkleTree = buildPatientsMerkleTree;
exports.buildPharmaciesMerkleTree = buildPharmaciesMerkleTree;
exports.getDoctorsAddressList = getDoctorsAddressList;
exports.getPatientsAddressList = getPatientsAddressList;
exports.getPharmaciesAddressList = getPharmaciesAddressList;
