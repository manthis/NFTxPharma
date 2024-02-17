const medications = require('./medicines.json');

const getMedicationArrays = () => {
    const NB_MEDICATIONS = 10;

    let ids = [];
    let names = [];
    let prices = [];
    let rates = [];

    return medications.slice(0, NB_MEDICATIONS).map((medication) => {
        return {
            id: medication.id,
            name: medication.name,
            price: medication.price,
            rate: medication.rate,
        };
    });
};

exports.getMedicationArrays = getMedicationArrays;
