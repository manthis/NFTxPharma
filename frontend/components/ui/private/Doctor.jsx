import {
    Button,
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
} from "@chakra-ui/react";

export const Doctor = () => {
    return (
        <section className="flex flex-col items-center justify-center p-5 w-[80%]">
            <h1 className="text-2xl font-extrabold mb-10">
                Prescription d'ordonnance
            </h1>
            <div className="flex flex-row items-center justify-between p-5 space-x-4 w-[90%] mt-10">
                <Select placeholder="Sélectionner votre médicament" isRequired>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </Select>
                <NumberInput defaultValue={1} min={0} max={20}>
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Button colorScheme="whatsapp">Ajouter</Button>
            </div>
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
                        <Tbody>
                            <Tr>
                                <Td>548768768</Td>
                                <Td>Paracétamol</Td>
                                <Td isNumeric>1</Td>
                                <Td isNumeric>100 wei</Td>
                            </Tr>
                            <Tr>
                                <Td>548768456</Td>
                                <Td>Doliprane</Td>
                                <Td isNumeric>3</Td>
                                <Td isNumeric>1000 wei</Td>
                            </Tr>
                            <Tr>
                                <Td>567987682</Td>
                                <Td>Viagra</Td>
                                <Td isNumeric>1</Td>
                                <Td isNumeric>5000 wei</Td>
                            </Tr>
                        </Tbody>
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
            <div className="w-[90%] flex flex-row items-center justify-between p-5 space-x-4 ">
                <Select placeholder="Adresse du patient" isRequired>
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                </Select>
                <Button colorScheme="whatsapp">Envoyer au patient</Button>
            </div>
        </section>
    );
};

export default Doctor;
