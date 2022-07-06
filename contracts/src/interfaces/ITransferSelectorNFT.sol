// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

interface ITransferSelectorNFT {
    function checkTransferManagerForToken(address collection) external view returns (address);
}
