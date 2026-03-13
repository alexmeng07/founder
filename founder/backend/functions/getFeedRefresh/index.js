const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

exports.handler = async () => {
  const client = new DynamoDBClient();
  const doc = DynamoDBDocumentClient.from(client);

  try {
    await doc.send(
      new ScanCommand({
        TableName: process.env.PROJECTS_TABLE,
        ProjectionExpression: 'projectId, status',
        Limit: 1,
      })
    );
  } catch (err) {
    console.error('Feed refresh check failed:', err);
  }

  return { statusCode: 200 };
};
