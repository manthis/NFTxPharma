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
} from "@chakra-ui/react";

export const Patient = () => {
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
                                <Th>Médecin</Th>
                                <Th>Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>548768768</Td>
                                <Td>0xcE…718a</Td>
                                <Td>
                                    <div className="flex flex-row items-center justify-between space-x-4">
                                        <Select
                                            placeholder="Pharmacie"
                                            size={"xs"}
                                            isRequired
                                        >
                                            <option value="option1">
                                                Option 1
                                            </option>
                                            <option value="option2">
                                                Option 2
                                            </option>
                                            <option value="option3">
                                                Option 3
                                            </option>
                                        </Select>
                                        <Button
                                            colorScheme="whatsapp"
                                            size="xs"
                                        >
                                            Envoyer
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>548768768</Td>
                                <Td>0xcE…718a</Td>
                                <Td>
                                    <div className="flex flex-row items-center justify-between space-x-4">
                                        <Select
                                            placeholder="Pharmacie"
                                            size={"xs"}
                                            isRequired
                                        >
                                            <option value="option1">
                                                Option 1
                                            </option>
                                            <option value="option2">
                                                Option 2
                                            </option>
                                            <option value="option3">
                                                Option 3
                                            </option>
                                        </Select>
                                        <Button
                                            colorScheme="whatsapp"
                                            size="xs"
                                        >
                                            Envoyer
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                        </Tbody>
                        <Tfoot>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Patient</Th>
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
