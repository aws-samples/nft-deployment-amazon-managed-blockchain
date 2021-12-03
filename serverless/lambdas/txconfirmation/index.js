const AWS = require('aws-sdk');
const ecs = new AWS.ECS()

exports.handler = async (event) => {
let resp = null;
const txid = event.Records[0].Sns.Message
const subnetId = `["${process.env.subnetId}"]`
const subnet = JSON.parse(subnetId);

const params = {
  cluster: process.env.clusterName,
  enableECSManagedTags: true,
  launchType: "FARGATE",
  count: 1,
  platformVersion: 'LATEST',
  networkConfiguration: { 
    awsvpcConfiguration: { 
        assignPublicIp: "ENABLED",
        subnets: subnet
    }
  },
   overrides: {
        'containerOverrides':[
            { 
                'name': process.env.containerName,
                    
                'environment':[
                {
                 'name': "txid",
                 'value': txid
                },
                {
                 'name': "nodeId",
                 'value': process.env.nodeId
                },                {
                 'name': "networkId",
                 'value': process.env.networkId
                },                {
                 'name': "topicarn",
                 'value': process.env.snsTopic
                },
                {
                 'name': "BLOCKS_NUMBER",
                 'value': process.env.confirmationBlocks
                }
                ]

               }]
    },
  startedBy: "txconfirmation-lambda",
  taskDefinition: process.env.taskDefinition
}

console.log("Starting execution...");
if(txid !== null && txid !== '') {
  try {  
  const resp = await ecs.runTask(params).promise();
  console.log("done.")
  } catch (err) {
    console.log(err)
    resp = err;
  };
}
  else 
     resp = 'Transaction id invalid';

 return {
  statusCode: 200,
  body: JSON.stringify(resp),
  headers: {
      "Content-Type": "application/json"
  }
 }
}
