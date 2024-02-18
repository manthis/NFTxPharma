import { SocialSecurityAbi } from "@/components/contract/abi/SocialSecurityAbi";
import { config } from "@/components/contract/config";
import {
    Button,
    Divider,
    FormControl,
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
} from "@chakra-ui/react";
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";

export const Patient = () => {
    const { handleSubmit } = useForm();
    const { address, isConnected } = useAccount();
    const [nbNFT, setNbNFT] = useState(0);
    const [tokenIds, setTokenIds] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const parameters = {
        abi: SocialSecurityAbi,
        account: address,
        address: process.env.NEXT_PUBLIC_CONTRACT_SOCIALSECURITY_ADDRESS,
    };

    function onSubmit() {
        console.log("submit");
    }

    useEffect(() => {
        if (!address) return;

        const fetchNbNFT = async () => {
            const result = await readContract(config, {
                ...parameters,
                functionName: "balanceOf",
                args: [address],
            });
            setNbNFT(Number(result));
        };

        fetchNbNFT();
    }, [address]);

    useEffect(() => {
        if (nbNFT > 0) {
            const fetchTokenId = async () => {
                for (let i = 0; i < nbNFT; i++) {
                    const result = await readContract(config, {
                        ...parameters,
                        functionName: "tokenOfOwnerByIndex",
                        args: [address, i],
                    });

                    const uri = await readContract(config, {
                        ...parameters,
                        functionName: "tokenURI",
                        args: [result],
                    });
                    setTokenIds((tokenUris) => [...tokenUris, uri]);
                }
            };
            fetchTokenId();
        }
    }, [nbNFT, address]);

    useEffect(() => {
        if (tokenIds.length > 0) {
            tokenIds.forEach((tokenURI) => {
                setPrescriptions((prescriptions) => [
                    ...prescriptions,
                    tokenURI,
                ]);
            });
        }
    }, [tokenIds]);

    const prescToDisplay = prescriptions.map((prescription, index) => (
        <Tr key={index}>
            <Td>{index}</Td>
            <Td>
                <a href={prescription}>Cliquez ici</a>
            </Td>
            <Td>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl>
                        <div className="flex flex-row items-center justify-between space-x-4">
                            <Select
                                placeholder="Pharmacie"
                                size={"xs"}
                                isRequired
                            >
                                <option value="1">
                                    0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec
                                </option>
                            </Select>
                            <Button colorScheme="whatsapp" size="xs">
                                Envoyer
                            </Button>
                        </div>
                    </FormControl>
                </form>
            </Td>
        </Tr>
    ));

    return (
        <section className="flex flex-col items-center justify-center p-5 w-[80%]">
            <h1 className="text-2xl font-extrabold mb-10">Espace Patient</h1>
            <div className="w-[90%] mb-10">
                <TableContainer>
                    <Table variant="simple">
                        <TableCaption>Ordonnances reçues</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Ordonnance</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>{prescToDisplay}</Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Ordonnance</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            </div>
            <Divider />
            <div className="w-[90%] mt-10">
                <TableContainer>
                    <Table variant="simple">
                        <TableCaption>Ordonnances à payer</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Pharmacie</Th>
                                <Th isNumeric>Prix</Th>
                                <Th>Payer</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>548768768</Td>
                                <Td>Paracétamol</Td>
                                <Td isNumeric>100 wei</Td>
                                <Td>
                                    <Button colorScheme="red" size="xs">
                                        Payer
                                    </Button>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>548768456</Td>
                                <Td>Doliprane</Td>
                                <Td isNumeric>1000 wei</Td>
                                <Td>
                                    <Button colorScheme="red" size="xs">
                                        Payer
                                    </Button>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>567987682</Td>
                                <Td>Viagra</Td>
                                <Td isNumeric>5000 wei</Td>
                                <Td>
                                    <Button colorScheme="red" size="xs">
                                        Payer
                                    </Button>
                                </Td>
                            </Tr>
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Pharmacie</Th>
                                <Th isNumeric>Prix</Th>
                                <Th>Payer</Th>
                            </Tr>
                        </Tfoot>
                    </Table>
                </TableContainer>
            </div>
        </section>
    );
};

export default Patient;
