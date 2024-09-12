const { expect, assert, should } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StorageTest", function () {
    before(async function () {
        const [owner] = await ethers.getSigners();

        const Storage = await ethers.getContractFactory("StorageTest");
        this.storage = await Storage.deploy();

        await this.storage.waitForDeployment();

        this.owner = owner;
        this.encoder = ethers.AbiCoder.defaultAbiCoder();
        this.storageTestAddress = await this.storage.getAddress();
    });

    it("should get storage value for slot 0", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 0);
        expect(value).to.equal(this.encoder.encode(["uint256"], [123]));
    });

    it("should get storage value for slot 1", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 1);
        assert.equal(
            value,
            ethers.zeroPadValue(
                ethers.concat([
                    ethers.toBeHex(await this.owner.getAddress(), 20),
                    ethers.toBeHex(1, 1),
                ]),
                32
            )
        );
    });

    it("should get storage value for slot 2", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 2);
        assert(value, ethers.concat([ethers.toBeHex(777, 16), ethers.toBeHex(555, 16)]));
    });

    it("should get storage value for slot 3", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 3);
        assert.equal(
            value,
            ethers.zeroPadBytes(ethers.hexlify(ethers.toUtf8Bytes("simple bytes32")), 32)
        );
    });

    it("should get storage value for slot 4", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 4);
        assert.equal(value, ethers.toBeHex(999, 32));
    });

    it("should get storage value for slot 5", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 5);
        assert.equal(
            value,
            ethers.zeroPadValue(
                ethers.concat([await this.owner.getAddress(), ethers.toBeHex(1, 1)]),
                32
            )
        );
    });

    it("should get storage value for slot 6", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 6);
        assert.equal(value, ethers.toBeHex(1, 32));
    });

    it("should get storage value for slot 7", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 7);
        assert.equal(value, ethers.toBeHex(2, 32));
    });

    it("should get storage value for slot 8", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 8);
        assert.equal(value, ethers.toBeHex(3, 32));
    });

    it("should get storage value for slot 9", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 9);
        assert.equal(value, ethers.toBeHex(3, 32)); //length of dynamicArray
    });

    it("should get storage value for slot holding values for slot 9 dynamic array", async function () {
        const positionIndex0 = ethers.keccak256(this.encoder.encode(["uint256"], [9]));
        const slotIndex0 = await ethers.provider.getStorage(
            this.storageTestAddress,
            ethers.toBigInt(positionIndex0)
        );

        assert.equal(slotIndex0, ethers.toBeHex(10, 32));

        const slotIndex1 = await ethers.provider.getStorage(
            this.storageTestAddress,
            ethers.toBigInt(positionIndex0) + ethers.toBigInt(1)
        );

        assert.equal(slotIndex1, ethers.toBeHex(20, 32));

        const slotIndex2 = await ethers.provider.getStorage(
            this.storageTestAddress,
            ethers.toBigInt(positionIndex0) + ethers.toBigInt(2)
        );

        assert.equal(slotIndex2, ethers.toBeHex(30, 32));
    });

    it("should get storage value for slot 10 - 12", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 10);

        assert.equal(value, ethers.toBeHex(0, 32));

        // location of value in key k = keccak256(abiencodePacked(k, slot))
        // where slot is the slot number of the mapping

        const slotIndex0 = await ethers.provider.getStorage(
            this.storageTestAddress,
            ethers.solidityPackedKeccak256(["uint256", "uint256"], [5, 10])
        );

        assert.equal(slotIndex0, ethers.toBeHex(500, 32));

        const slotIndex1 = await ethers.provider.getStorage(
            this.storageTestAddress,
            ethers.solidityPackedKeccak256(["uint256", "uint256"], [10, 10])
        );

        assert.equal(slotIndex1, ethers.toBeHex(1000, 32));
    });

    //   mapping(uint256 => mapping(address => uint256)) public nestedMapping;
    it("should get storage value for nested mapping slots", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 11);

        assert.equal(value, ethers.toBeHex(0, 32));

        //keccak256(innerK, keccak256(abiencodePacked(outerK, slot))

        const address = await this.owner.getAddress();
        const outterSlot1 = ethers.solidityPackedKeccak256(["uint256", "uint256"], [1, 11]);
        const innerSlot1 = ethers.solidityPackedKeccak256(
            ["bytes32", "bytes32"],
            [ethers.zeroPadValue(address, 32), outterSlot1]
        );

        assert.equal(
            await ethers.provider.getStorage(this.storageTestAddress, innerSlot1),
            ethers.toBeHex(100, 32)
        );

        const outterSlot2 = ethers.solidityPackedKeccak256(["uint256", "uint256"], [2, 11]);
        const innerSlot2 = ethers.solidityPackedKeccak256(
            ["bytes32", "bytes32"],
            [ethers.zeroPadValue(address, 32), outterSlot2]
        );

        assert.equal(
            await ethers.provider.getStorage(this.storageTestAddress, innerSlot2),
            ethers.toBeHex(200, 32)
        );
    });

    // uint256[][] public nestedDynamicArray;
    //[
    //    [1, 2, 3, 4],
    //    [5, 6, 7, 8, 9]
    // ]
    it("should get storage value for nested dynamic array slots", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 12);

        assert.equal(value, ethers.toBeHex(2, 32));

        const positionArrayIndex0 = ethers.keccak256(this.encoder.encode(["uint256"], [12]));

        assert.equal(
            await ethers.provider.getStorage(this.storageTestAddress, positionArrayIndex0),
            ethers.toBeHex(4, 32)
        );

        const arrayOneSlot = ethers.toBigInt(positionArrayIndex0);
        const arrayTwoSlot = ethers.toBigInt(positionArrayIndex0) + ethers.toBigInt(1);

        assert.equal(4, await ethers.provider.getStorage(this.storageTestAddress, arrayOneSlot));
        assert.equal(5, await ethers.provider.getStorage(this.storageTestAddress, arrayTwoSlot));

        //Items in first inner array
        assert.equal(
            ethers.toBeHex(1, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.keccak256(positionArrayIndex0)
            )
        );

        assert.equal(
            ethers.toBeHex(2, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(positionArrayIndex0)) + ethers.toBigInt(1)
            )
        );

        assert.equal(
            ethers.toBeHex(3, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(positionArrayIndex0)) + ethers.toBigInt(2)
            )
        );

        assert.equal(
            ethers.toBeHex(4, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(positionArrayIndex0)) + ethers.toBigInt(3)
            )
        );

        assert.equal(
            ethers.toBeHex(1, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.keccak256(positionArrayIndex0)
            )
        );

        assert.equal(
            ethers.toBeHex(2, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(positionArrayIndex0)) + ethers.toBigInt(1)
            )
        );

        assert.equal(
            ethers.toBeHex(3, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(positionArrayIndex0)) + ethers.toBigInt(2)
            )
        );

        assert.equal(
            ethers.toBeHex(4, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(positionArrayIndex0)) + ethers.toBigInt(3)
            )
        );

        //Items in second inner array
        assert.equal(
            ethers.toBeHex(5, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.keccak256(ethers.toBeHex(arrayTwoSlot, 32))
            )
        );

        assert.equal(
            ethers.toBeHex(6, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(ethers.toBeHex(arrayTwoSlot, 32))) +
                    ethers.toBigInt(1)
            )
        );

        assert.equal(
            ethers.toBeHex(7, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(ethers.toBeHex(arrayTwoSlot, 32))) +
                    ethers.toBigInt(2)
            )
        );

        assert.equal(
            ethers.toBeHex(8, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(ethers.toBeHex(arrayTwoSlot, 32))) +
                    ethers.toBigInt(3)
            )
        );

        assert.equal(
            ethers.toBeHex(9, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(ethers.toBeHex(arrayTwoSlot, 32))) +
                    ethers.toBigInt(4)
            )
        );
    });

    it("should get storage value for slot 13", async function () {
        const value = await ethers.provider.getStorage(this.storageTestAddress, 13);
        assert.equal(value, ethers.toBeHex(0, 32));

        const arraySlot = ethers.keccak256(
            this.encoder.encode(["address", "uint256"], [await this.owner.getAddress(), 13])
        );

        const slotIndex0 = await ethers.provider.getStorage(this.storageTestAddress, arraySlot);

        assert.equal(slotIndex0, ethers.toBeHex(2, 32));

        assert.equal(
            ethers.toBeHex(1234, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.keccak256(ethers.toBeHex(arraySlot, 32))
            )
        );

        assert.equal(
            ethers.toBeHex(5678, 32),
            await ethers.provider.getStorage(
                this.storageTestAddress,
                ethers.toBigInt(ethers.keccak256(ethers.toBeHex(arraySlot, 32))) +
                    ethers.toBigInt(1)
            )
        );
    });
});

// npx hardhat test test/get-storage.js
