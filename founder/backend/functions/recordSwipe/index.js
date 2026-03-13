const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

function getUserId(event) {
  const h = event.headers || {};
  return h['x-mock-user-id'] || h['X-Mock-User-Id'] || event.requestContext?.authorizer?.claims?.sub;
}

exports.handler = async (event) => {
  try {
    const swiperId = getUserId(event);
    if (!swiperId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}');
    const { swipeeId, direction } = body;
    if (!swipeeId || !direction) {
      return jsonResponse(400, { success: false, error: 'swipeeId and direction required' });
    }
    if (!['left', 'right'].includes(direction)) {
      return jsonResponse(400, { success: false, error: 'direction must be left or right' });
    }

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);
    const now = new Date().toISOString();

    await doc.send(
      new PutCommand({
        TableName: process.env.SWIPES_TABLE,
        Item: { swiperId, swipeeId, direction, timestamp: now },
      })
    );

    let matched = false;
    if (direction === 'right') {
      const { Items } = await doc.send(
        new QueryCommand({
          TableName: process.env.SWIPES_TABLE,
          IndexName: 'SwipeeIndex',
          KeyConditionExpression: 'swipeeId = :sid',
          FilterExpression: 'swiperId = :eid',
          ExpressionAttributeValues: { ':sid': swiperId, ':eid': swipeeId },
        })
      );
      const mutualRight = Items?.some((i) => i.direction === 'right');
      if (mutualRight) {
        matched = true;
        const sns = new SNSClient();
        await sns.send(
          new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Message: JSON.stringify({
              matchedUserId1: swiperId,
              matchedUserId2: swipeeId,
            }),
          })
        );
      }
    }

    return jsonResponse(200, {
      success: true,
      data: { matched },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to record swipe' });
  }
};
