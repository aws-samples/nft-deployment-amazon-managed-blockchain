const AWSHttpProvider = require('./aws-web3-http-provider');
const utils  = require('./utils');
const ethers = require('ethers');
const AWS = require('aws-sdk');
const nodeId = process.env.nodeId;
const networkId = process.env.networkId;

const getOwner = async (contractAddress,tokenID) => {
    let endpoint = await utils.getHTTPendpoint(nodeId,networkId)
    endpoint = `https://${endpoint}`;
    const baseProvider = new AWSHttpProvider(endpoint);
    const provider = new ethers.providers.Web3Provider(baseProvider);

//  retrieve the pvt key from ssm and generate a wallet address

    const pvtKey = await utils.getSSMParam(process.env.pvtkey);
    const  myWallet = new ethers.Wallet(pvtKey, provider);

    //create an instance of the contract
    const abi = require('./NFTSamples/build/NFT_BaseURI.json').abi;

    //attaching to a deployed contract and interacting with your contract
    const erc721 = new ethers.Contract(contractAddress, abi, myWallet);
    try {
    const owner = await erc721.ownerOf(tokenID);
    return {"Owner address": owner};
      } catch (error) {
     return {"Error": error};
    }
  }  

module.exports = { getOwner:getOwner }
