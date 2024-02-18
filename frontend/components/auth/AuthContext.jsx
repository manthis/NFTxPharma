import { DoctorAbi } from "@/components/contract/abi/DoctorAbi";
import { PatientAbi } from "@/components/contract/abi/PatientAbi";
import { PharmacyAbi } from "@/components/contract/abi/PharmarcyAbi";
import {
    getDoctorsTreeProof,
    getPatientsTreeProof,
    getPharmaciesTreeProof,
} from "@/components/contract/whitelists/merkletrees";
import { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [authState, setAuthState] = useState(null);
    const { address, isConnected } = useAccount();

    // We check if the user is a patient
    const {
        error: errorPatient,
        data: dataPatient,
        status: statusPatient,
    } = useReadContract({
        abi: PatientAbi,
        account: address,
        address: process.env.NEXT_PUBLIC_CONTRACT_PATIENT_ADDRESS,
        functionName: "isPatient",
        args: [address, getPatientsTreeProof(address)],
        enabled: !!address,
    });

    // We check if the user is a doctor
    const {
        error: errorDoctor,
        data: dataDoctor,
        status: statusDoctor,
    } = useReadContract({
        abi: DoctorAbi,
        account: address,
        address: process.env.NEXT_PUBLIC_CONTRACT_DOCTOR_ADDRESS,
        functionName: "isDoctor",
        args: [address, getDoctorsTreeProof(address)],
        enabled: !!address,
    });

    // We check if the user is a pharmacy
    const {
        error: errorPharmacy,
        data: dataPharmacy,
        status: statusPharmacy,
    } = useReadContract({
        abi: PharmacyAbi,
        account: address,
        address: process.env.NEXT_PUBLIC_CONTRACT_PHARMACY_ADDRESS,
        functionName: "isPharmacy",
        args: [address, getPharmaciesTreeProof(address)],
        enabled: !!address,
    });

    const isPatient = dataPatient ? true : false;
    const isDoctor = dataDoctor ? true : false;
    const isPharmarcy = dataPharmacy ? true : false;

    /*
    console.log(`isPatient: ${isPatient}`);
    console.log(`isDoctor: ${isDoctor}`);
    console.log(`isPharmarcy: ${isPharmarcy}`);
    */

    useEffect(() => {
        if (address) {
            const userData = {
                isConnected: isConnected,
                address: address,
                patient: isPatient,
                doctor: isDoctor,
                pharmacy: isPharmarcy,
            };

            setAuthState(userData);
        } else {
            // Gérer le cas où address est null
            setAuthState(null);
        }
    }, [
        isConnected,
        address,
        errorPatient,
        dataPatient,
        statusPatient,
        errorDoctor,
        dataDoctor,
        statusDoctor,
        errorPharmacy,
        statusPharmacy,
    ]);

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);
