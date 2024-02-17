import {
    Button,
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

export const Pharmacy = () => {
    return (
        <section className="flex flex-col items-center justify-center p-5 w-[80%]">
            <h1 className="text-2xl font-extrabold mb-10">Pharmacie</h1>
            <div className="w-[90%]">
                <TableContainer>
                    <Table variant="simple">
                        <TableCaption>Ordonnances à traiter</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Patient</Th>
                                <Th>Statut</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>548768768</Td>
                                <Td>0xcE…718a</Td>
                                <Td>Status</Td>
                                <Td>
                                    <div className="flex flex-row items-center justify-left space-x-3">
                                        <Button
                                            colorScheme="whatsapp"
                                            size="xs"
                                        >
                                            Envoyer
                                        </Button>
                                        <Button colorScheme="twitter" size="xs">
                                            Livrer
                                        </Button>
                                        <Button colorScheme="red" size="xs">
                                            Burn
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>548768768</Td>
                                <Td>0xcE…718a</Td>
                                <Td>Status</Td>
                                <Td>
                                    <div className="flex flex-row items-center justify-left space-x-3">
                                        <Button
                                            colorScheme="whatsapp"
                                            size="xs"
                                        >
                                            Envoyer
                                        </Button>
                                        <Button colorScheme="twitter" size="xs">
                                            Livrer
                                        </Button>
                                        <Button colorScheme="red" size="xs">
                                            Burn
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td>548768768</Td>
                                <Td>0xcE…718a</Td>
                                <Td>Status</Td>
                                <Td>
                                    <div className="flex flex-row items-center justify-left space-x-3">
                                        <Button
                                            colorScheme="whatsapp"
                                            size="xs"
                                        >
                                            Envoyer
                                        </Button>
                                        <Button colorScheme="twitter" size="xs">
                                            Livrer
                                        </Button>
                                        <Button colorScheme="red" size="xs">
                                            Burn
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
        </section>
    );
};

export default Pharmacy;
