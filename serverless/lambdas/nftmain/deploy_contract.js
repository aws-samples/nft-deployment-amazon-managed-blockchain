const AWS = require('aws-sdk');
const AWSHttpProvider = require('./aws-web3-http-provider');
const utils = require('./utils');
const ethers = require('ethers');
const sns =  new AWS.SNS();
const nodeId = process.env.nodeId;
const networkId = process.env.networkId;

const deployContract = async (tokenName,tokenTicker, s3URI) => {
    let endpoint = await utils.getHTTPendpoint(nodeId,networkId)
    endpoint = `https://${endpoint}`;
    const  baseProvider = new AWSHttpProvider(endpoint);
    const provider = new ethers.providers.Web3Provider(baseProvider);

//  retrieve the pvt key from ssm and generate a wallet address

    const pvtKey = await utils.getSSMParam(process.env.pvtkey)
    const  myWallet = new ethers.Wallet(pvtKey, provider);

    //create an instance of the contract

    const abi = require('./NFTSamples/build/NFT_BaseURI.json').abi;
    const bytecode = require('./NFTSamples/build/NFT_BaseURI.json').bytecode;

    //deploy smart contract
    console.log(tokenName, tokenTicker, s3URI)
    try {
    const factory = new ethers.ContractFactory(abi, bytecode, myWallet);
    const contract = await factory.deploy(tokenName, tokenTicker, s3URI);
    const txid = contract.deployTransaction.hash;

    //send sns on success

    const  params  = {
    Message: txid,
    TopicArn: process.env.snsTopic
     };
    const snsPromise = await new Promise(function(resolve, reject) {
        sns.publish(params, function(err, data) {
            if (err) {
                console.log(err)
                return reject(err)
            } else {
                console.log(data)
                return resolve(data)
            }
          })
       })
    console.log(txid); 
    return { "Transaction id" : txid, "ContractAddress": contract.address}
      } catch (error) {
     return {"Error": error};
    }
}    

module.exports = { deployContract:deployContract }
