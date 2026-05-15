const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const docClient = DynamoDBDocumentClient.from(client);

async function saveAnalysisToDynamoDB({
  analysisId,
  resumeFileName,
  s3Bucket,
  s3Key,
  jobDescription,
  analysisResult,
}) {
  const item = {
    analysisId,
    resumeFileName,
    s3Bucket,
    s3Key,
    jobDescription,
    matchScore: analysisResult.matchScore,
    summary: analysisResult.summary,
    fullResult: analysisResult,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: item,
    })
  );

  return item;
}

async function getAnalysisHistory() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    })
  );

  return (result.Items || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

module.exports = {
  saveAnalysisToDynamoDB,
  getAnalysisHistory,
};