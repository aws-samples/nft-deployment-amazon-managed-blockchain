// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// use these imports if using Remix, otherwise use the GitHub links
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; 

/**This contract implements basic ERC721 NFT functionality with auto-incremented token ID's and a method
 * for storing a base URI for off-chain metadata using the format baseURI + "/" + _tokenIdCounter
 * 
 * Provide the uri variable in the constructor in string format. E.g. "https://my-metadata.com/"
 **/
contract NFT_BaseURI is ERC721, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    string baseURI;

    constructor(string memory name, string memory ticker, string memory uri) ERC721(name, ticker) {
        setBaseURI(uri);
    }

    function safeMint(address to) public onlyOwner {
        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }
    
    function setBaseURI(string memory baseURI_) internal {
        baseURI = baseURI_;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
