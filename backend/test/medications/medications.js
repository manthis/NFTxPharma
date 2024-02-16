const medications = require('./medicines.json');

const getMedicationArrays = () => {
    let ids = [];
    let names = [];
    let prices = [];
    let rates = [];

    return medications.map((medication) => {
        return {
            id: medication.id,
            name: medication.name,
            price: medication.price,
            rate: medication.rate,
        };
    });
};

exports.getMedicationArrays = getMedicationArrays;
