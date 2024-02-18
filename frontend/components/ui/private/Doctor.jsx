import { SocialSecurityAbi } from "@/components/contract/abi/SocialSecurityAbi";
import { getMedicationArray } from "@/components/contract/medications/medications";
import {
    getDoctorsTreeProof,
    getPatientsTreeProof,
} from "@/components/contract/whitelists/merkletrees";
import {
    Button,
    FormControl,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Select,
    Table,
    TableCaption,
    TableContainer,
    Tbody,
    Td,
    Tfoot,
    Th,
    Thead,
    Tr,
    useToast,
} from "@chakra-ui/react";
import { NFTStorage } from "nft.storage";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount, useWriteContract } from "wagmi";

export const Doctor = () => {
    const [medicineID, setMedicineID] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [medicineList, setMedicineList] = useState([]);
    const [patientAddress, setPatientAddress] = useState("");
    const { writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                setMedicineID("");
                setQuantity(1);
                setMedicineList([]);
                setPatientAddress("");

                toast({
                    title: "Ordonnance envoyée",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
            },
            onError: (error) => {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            },
        },
    });
    const { address, isConnected } = useAccount();
    const toast = useToast();

    const { handleSubmit } = useForm();

    function onSubmit() {
        const medications = getMedicationArray();
        const medicationToAdd = medications.find(
            (medication) => medication.id == medicineID
        );

        if (medicationToAdd) {
            medicationToAdd.quantity = quantity;
            setMedicineList((currentMedicineList) => [
                ...currentMedicineList,
                medicationToAdd,
            ]);
        }
    }

    async function onSend() {
        if (medicineList.length !== 0) {
            let tokenURI = "";
            const client = new NFTStorage({
                token: process.env.NEXT_PUBLIC_NFTSTORAGE_API_KEY,
            });

            // We must send the file to IPFS
            const medicineListJson = JSON.stringify(medicineList);
            // console.log(medicineListJson);
            const metadata = await client.store({
                name: "NFTxP",
                description: "ERC721 Prescription metadata.",
                image: new File(["<DATA>"], "nftxp.png", {
                    type: "image/png",
                }),
                properties: {
                    custom: "Custom data",
                    file: new File([medicineListJson], "prescription.json", {
                        type: "application/json",
                    }),
                },
            });

            tokenURI = metadata.embed().properties.file.href;
            if (tokenURI) {
                /*
                    console.log("IPFS URL for the metadata:", tokenURI);
                    console.log("metadata.json contents:\n", metadata.data);
                    console.log(
                        "metadata.json contents with IPFS gateway URLs:\n",
                        metadata.embed()
                    );
                */

                writeContract({
                    address:
                        process.env.NEXT_PUBLIC_CONTRACT_SOCIALSECURITY_ADDRESS,
                    account: address,
                    abi: SocialSecurityAbi,
                    functionName: "mintPrescription",
                    args: [
                        patientAddress,
                        tokenURI,
                        getDoctorsTreeProof(address),
                        getPatientsTreeProof(patientAddress),
                    ],
                });
            } else {
                toast({
                    title: "Impossible d'envoyer l'ordonnance.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } else {
            toast({
                title: "Aucun médicament dans l'ordonnance.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    }

    // We get the medications available for the select component
    const medications = getMedicationArray();
    const options = medications.map((medication) => {
        return (
            <option key={medication.id} value={medication.id}>
                {medication.name}
            </option>
        );
    });

    const medicationList = medicineList?.map((medication) => {
        return (
            <Tr key={medication.id}>
                <Td>{medication.id}</Td>
                <Td>{medication.name}</Td>
                <Td>{medication.quantity}</Td>
                <Td>{medication.price} wei</Td>
            </Tr>
        );
    });

    return (
        <section className="flex flex-col items-center justify-center p-5 w-[80%]">
            <h1 className="text-2xl font-extrabold mb-10">
                Prescription d'ordonnance
            </h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl>
                    <div className="flex flex-row items-center justify-between p-5 space-x-4 w-[90%] mt-10 ml-10">
                        <Select
                            placeholder="Sélectionner votre médicament"
                            isRequired
                            onChange={(e) => setMedicineID(e.target.value)}
                            value={medicineID}
                        >
                            {options}
                        </Select>
                        <NumberInput
                            defaultValue={1}
                            value={quantity}
                            min={1}
                            max={20}
                            onChange={(e) => setQuantity(parseInt(e))}
                        >
                            <NumberInputField />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                        <Button colorScheme="whatsapp" type="submit">
                            Ajouter
                        </Button>
                    </div>
                </FormControl>
            </form>
            <div className="w-[90%]">
                <TableContainer>
                    <Table variant="simple">
                        <TableCaption>Médicaments préscrits</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Dénomination</Th>
                                <Th isNumeric>Quantité</Th>
                                <Th isNumeric>Prix</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{medicationList}</Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Dénomination</Th>
                                <Th isNumeric>Quantité</Th>
                                <Th isNumeric>Prix</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            </div>
            <form onSubmit={handleSubmit(onSend)}>
                <FormControl>
                    <div className="w-[100%] flex flex-row items-center justify-between p-5 space-x-4 ">
                        <Select
                            placeholder="Adresse du patient"
                            isRequired
                            onChange={(e) => setPatientAddress(e.target.value)}
                            value={patientAddress}
                        >
                            <option
                                key="1"
                                value="0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
                            >
                                0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
                            </option>
                        </Select>
                        <Button colorScheme="whatsapp" type="submit">
                            Envoyer au patient
                        </Button>
                    </div>
                </FormControl>
            </form>
        </section>
    );
};

export default Doctor;
