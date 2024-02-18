import { SocialSecurityAbi } from "@/components/contract/abi/SocialSecurityAbi";
import { config } from "@/components/contract/config";
import {
    getPatientsTreeProof,
    getPharmaciesTreeProof,
} from "@/components/contract/whitelists/merkletrees";
import {
    Button,
    Divider,
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
import { readContract } from "@wagmi/core";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";

export const Patient = () => {
    const { address, isConnected } = useAccount();
    const [nbNFT, setNbNFT] = useState(0);
    const [tokenIds, setTokenIds] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [selections, setSelections] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const toast = useToast();
    const { writeContract } = useWriteContract({
        mutation: {
            onSuccess: () => {
                const filteredPrescriptions = prescriptions.filter(
                    (prescription) => prescription.tokenId !== selectedId
                );
                setPrescriptions(filteredPrescriptions);
                setNbNFT(nbNFT - 1);
                setSelectedId(null);
                setTokenIds([]);
                setSelections({});

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

    const parameters = {
        abi: SocialSecurityAbi,
        account: address,
        address: process.env.NEXT_PUBLIC_CONTRACT_SOCIALSECURITY_ADDRESS,
    };

    const handleSelectChange = (tokenId, value) => {
        setSelections((prev) => ({ ...prev, [tokenId]: value }));
        setSelectedId(tokenId);
    };

    const handleSendClick = async (tokenId) => {
        const pharmarcyAddress = selections[tokenId];
        console.log("Token ID:", tokenId, "Sélection:", pharmarcyAddress);

        writeContract({
            ...parameters,
            functionName: "transferToPharmacy",
            args: [
                getPatientsTreeProof(address),
                pharmarcyAddress,
                getPharmaciesTreeProof(pharmarcyAddress),
                tokenId,
            ],
        });
    };

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
                    const id = await readContract(config, {
                        ...parameters,
                        functionName: "tokenOfOwnerByIndex",
                        args: [address, i],
                    });

                    const uri = await readContract(config, {
                        ...parameters,
                        functionName: "tokenURI",
                        args: [id],
                    });

                    setTokenIds((tokenUris) => [
                        ...tokenUris,
                        {
                            tokenId: id,
                            tokenURI: uri,
                        },
                    ]);
                }
            };
            fetchTokenId();
        }
    }, [nbNFT]);

    useEffect(() => {
        if (tokenIds.length > 0) {
            tokenIds.forEach((tokenInfo) => {
                const tokenIDToFind = tokenInfo.tokenId;

                // Look for the tokenIDToFind in prescriptions
                const tokenIndex = prescriptions.findIndex(
                    (token) => token.tokenId == tokenIDToFind
                );
                if (tokenIndex === -1) {
                    setPrescriptions((tokenInfos) => [
                        ...tokenInfos,
                        tokenInfo,
                    ]);
                }
            });
        }
    }, [tokenIds, prescriptions]);

    const prescToDisplay = prescriptions.map((tokenInfo, index) => (
        <Tr key={index}>
            <Td>{tokenInfo.tokenId.toString()}</Td>
            <Td>
                <a href={tokenInfo.tokenURI}>Cliquez ici</a>
            </Td>
            <Td>
                <div className="flex flex-row items-center justify-between space-x-4">
                    <Select
                        placeholder="Pharmacie"
                        size={"xs"}
                        isRequired
                        onChange={(e) =>
                            handleSelectChange(
                                tokenInfo.tokenId,
                                e.target.value
                            )
                        }
                    >
                        <option value="0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec">
                            0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec
                        </option>
                    </Select>
                    <Button
                        colorScheme="whatsapp"
                        size="xs"
                        onClick={() => {
                            handleSendClick(tokenInfo.tokenId);
                        }}
                    >
                        Envoyer
                    </Button>
                </div>
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
                                <Td>0x1CBd...3C9Ec</Td>
                                <Td isNumeric>100 wei</Td>
                                <Td>
                                    <Button colorScheme="red" size="xs">
                                        Payer
                                    </Button>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>548768456</Td>
                                <Td>0x1CBd...3C9Ec</Td>
                                <Td isNumeric>1000 wei</Td>
                                <Td>
                                    <Button colorScheme="red" size="xs">
                                        Payer
                                    </Button>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>567987682</Td>
                                <Td>0x1CBd...3C9Ec</Td>
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
