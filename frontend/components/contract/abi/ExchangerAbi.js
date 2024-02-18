export const ExchangerAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: 'laboratoryContractAddress',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'pharmaContract',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'patientContract',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        inputs: [],
        name: 'ReentrancyGuardReentrantCall',
        type: 'error',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'orderId',
                type: 'uint256',
            },
        ],
        name: 'OrderPayed',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'orderId',
                type: 'uint256',
            },
        ],
        name: 'OrderPrepared',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'orderId',
                type: 'uint256',
            },
        ],
        name: 'OrderReady',
        type: 'event',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'orderId',
                type: 'uint256',
            },
            {
                internalType: 'bytes32[]',
                name: 'patientProof',
                type: 'bytes32[]',
            },
        ],
        name: 'getOrderPrice',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'orderId',
                type: 'uint256',
            },
        ],
        name: 'isOrderReady',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'labContractAddress_',
        outputs: [
            {
                internalType: 'contract IERC1155',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'orderId',
                type: 'uint256',
            },
            {
                internalType: 'bytes32[]',
                name: 'pharmacyProof',
                type: 'bytes32[]',
            },
        ],
        name: 'makeOrderReady',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'orderIdCounter_',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'orders_',
        outputs: [
            {
                internalType: 'address',
                name: 'pharmacy',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'patient',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'totalPrice',
                type: 'uint256',
            },
            {
                internalType: 'bool',
                name: 'isReady',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'orderId',
                type: 'uint256',
            },
            {
                internalType: 'bytes32[]',
                name: 'patientProof',
                type: 'bytes32[]',
            },
        ],
        name: 'payOrder',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'pharmacy',
                type: 'address',
            },
            {
                internalType: 'address',
                name: 'patient',
                type: 'address',
            },
            {
                internalType: 'uint256[]',
                name: 'medicineIds',
                type: 'uint256[]',
            },
            {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]',
            },
            {
                internalType: 'uint256',
                name: 'totalPriceInWei',
                type: 'uint256',
            },
            {
                internalType: 'bytes32[]',
                name: 'pharmacyProof',
                type: 'bytes32[]',
            },
        ],
        name: 'prepareOrder',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];

export default ExchangerAbi;
