const AWS = require('aws-sdk');
const deployContract = require('./deploy_contract');
const mintNFT = require('./mint_nft');
const getOwner = require('./get_owner');
const region = process.env.AWS_DEFAULT_REGION;
const bucketName = process.env.bucketName;
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Handler
exports.handler = async function(event, context) {
  let responseObject = null;
try {
  console.log('EVENT', event.body);
  const requestType = JSON.parse(event.body).requestType;

  switch(requestType.toLowerCase()) {
      case 'deploy': 
 {
         let {requestType,tokenName, tokenTicker, metadataFilename, metadata} = JSON.parse(event.body);

         const fileParams = {
            Bucket: bucketName,
            ACL: 'public-read',
            Key: metadataFilename,
            Body: JSON.stringify(metadata)
           };
        //store the metadata file for the NFT in an S3 bucket

        await s3.putObject(fileParams).promise();
        const s3URI  = `https://${bucketName}.s3.${region}.amazonaws.com/${metadataFilename}`;
        responseObject = await deployContract.deployContract(tokenName, tokenTicker, s3URI);
        break;
 }

      case 'mint': 
{        
          let {contractAddress, mintAddress} = JSON.parse(event.body);
          //call the mint NFT function
          responseObject = await mintNFT.mintNFT(contractAddress, mintAddress)
         break;
}
      case 'getowner':
{
          let  {contractAddress, tokenID} = JSON.parse(event.body);
          //call the get owner function
          responseObject = await getOwner.getOwner(contractAddress, tokenID)
          break;
}
      default:
          responseObject = 'Invalid requestType or parameters';
          break;
  } //switch
    } catch (err) {
    console.log(err)
    responseObject = err;

     }

  console.log(responseObject);

  return {
     statusCode: 200,
     body: JSON.stringify(responseObject),
     headers: {
       "Content-Type": "application/json"
     }
  }
} 
