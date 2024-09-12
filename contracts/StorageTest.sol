// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StorageTest {
    uint256 public simpleUint;
    bool public simpleBool;
    address public simpleAddress;

    uint128 public largeUintA;
    uint128 public largeUintB;

    bytes32 public simpleBytes32;

    struct MyStruct {
        uint256 structUint;
        bool structBool;
        address structAddress;
    }

    MyStruct public myStruct;

    uint256[3] public fixedArray;

    uint256[] public dynamicArray;

    mapping(uint256 => uint256) public simpleMapping;

    // Nested mapping
    mapping(uint256 => mapping(address => uint256)) public nestedMapping;

    // Nested array of dynamic arrays
    uint256[][] public nestedDynamicArray;

    // Mapping to an array
    mapping(address => uint256[]) public addressToArray;

    // Array of mappings
    mapping(uint256 => mapping(uint256 => uint256))[] public arrayOfMappings;

    constructor() {
        // Assign values to the variables
        simpleUint = 123;
        simpleBool = true;
        simpleAddress = msg.sender;

        largeUintA = 555;
        largeUintB = 777;

        simpleBytes32 = "simple bytes32";

        myStruct = MyStruct({
            structUint: 999,
            structBool: true,
            structAddress: msg.sender
        });

        fixedArray[0] = 1;
        fixedArray[1] = 2;
        fixedArray[2] = 3;

        dynamicArray.push(10);
        dynamicArray.push(20);
        dynamicArray.push(30);

        simpleMapping[5] = 500;
        simpleMapping[10] = 1000;

        // Populate nested mapping
        nestedMapping[1][msg.sender] = 100;
        nestedMapping[2][msg.sender] = 200;

        // Populate nested dynamic array (array of arrays)
        nestedDynamicArray.push([1, 2, 3, 4]);
        nestedDynamicArray.push([5, 6, 7, 8, 9]);

        // Populate mapping to array (address to array)
        addressToArray[msg.sender].push(1234);
        addressToArray[msg.sender].push(5678);

        // Populate array of mappings
        arrayOfMappings.push();
        arrayOfMappings[0][1][1] = 999;
        arrayOfMappings[0][2][2] = 888;

        arrayOfMappings.push();
        arrayOfMappings[1][3][3] = 777;
        arrayOfMappings[1][4][4] = 666;
    }
}
