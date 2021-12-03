const AWS = require('aws-sdk');

// retrieve param from ssm parameter store
const getSSMParam  = async (name) => {
    const ssm = new (require('aws-sdk/clients/ssm'))()
    const param = {
      Name: name,
      WithDecryption: true
    };
    const retrievedParam = await ssm.getParameter(param).promise();
    return retrievedParam.Parameter.Value;
}

// retrieve AMB http endpoint

const getHTTPendpoint = async (nodeId, networkId) => {
      const amb = new (require('aws-sdk/clients/managedblockchain'))()
      const param = {
       NodeId: nodeId,
       NetworkId: networkId
      };
      const retrievedNode = await amb.getNode(param).promise();
      return retrievedNode.Node.FrameworkAttributes.Ethereum.HttpEndpoint
} 
module.exports = {
  getSSMParam,
  getHTTPendpoint
}
