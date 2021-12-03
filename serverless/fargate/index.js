const Web3 = require('web3');
const AWS = require('aws-sdk');
const BLOCKS_NUMBER = process.env.BLOCKS_NUMBER;
const txHash = process.env.txid;
const awaitTransactionMined = require ('await-transaction-mined');
const AWSHttpProvider = require('./aws-web3-http-provider');
const nodeId = process.env.nodeId
const networkId = process.env.networkId

//get amazon managed blockchain http endpoint
const getHTTPendpoint = async (nodeId, networkId) => {
      const amb = new (require('aws-sdk/clients/managedblockchain'))()
      let param = {
       NodeId: nodeId,
       NetworkId: networkId
      };
      const retrievedNode = await amb.getNode(param).promise();
      return retrievedNode.Node.FrameworkAttributes.Ethereum.HttpEndpoint
}
// await for the blocks to be confirmed on the blockchain

(async function() {
  let endpoint = await getHTTPendpoint(nodeId,networkId)
   endpoint = `https://${endpoint}`
   console.log("amb endpoint is",endpoint)
   const web3 = new Web3(new AWSHttpProvider(endpoint));
   const minedTxReceipt = await awaitTransactionMined.awaitTx(web3, txHash, {blocksToWait: BLOCKS_NUMBER});

   if(minedTxReceipt !== null && minedTxReceipt !== '') {
      const  params = {
      Message: `The transaction ${txHash} has been confirmed ${BLOCKS_NUMBER} times`,
      TopicArn: process.env.topicarn
      };
// send an SNS on completing the confirmations

    const publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
    publishTextPromise.then(
    function(data) {
     console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
     console.log("MessageID is " + data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
     });
    } 
     console.log("confirmed ...done")
 })();
