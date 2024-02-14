import medications from './medications.json';

const getMedicationArrays = () => {
    let ids[];
    let names[];
    let prices[];
    let rates[];

    return medications.map((medication) => {
        ids.push(medication.id);
        names.push(medication.name);
        prices.push(medication.price);
        rates.push(medication.rate);
    });
};

export default getMedicationArrays;
