const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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
    const likerId = getUserId(event);
    if (!likerId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const projectId = event.pathParameters?.projectId;
    if (!projectId) {
      return jsonResponse(400, { success: false, error: 'projectId required' });
    }

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);

    const { Items } = await doc.send(
      new QueryCommand({
        TableName: process.env.PROJECTS_TABLE,
        KeyConditionExpression: 'projectId = :pid',
        ExpressionAttributeValues: { ':pid': projectId },
      })
    );
    const project = Items?.[0];

    if (!project) {
      return jsonResponse(404, { success: false, error: 'Project not found' });
    }

    const { Item: liker } = await doc.send(
      new GetCommand({
        TableName: process.env.USERS_TABLE,
        Key: { userId: likerId },
      })
    );

    await doc.send(
      new UpdateCommand({
        TableName: process.env.PROJECTS_TABLE,
        Key: { projectId, ownerId: project.ownerId },
        UpdateExpression: 'SET likesCount = if_not_exists(likesCount, :zero) + :one',
        ExpressionAttributeValues: { ':zero': 0, ':one': 1 },
      })
    );

    return jsonResponse(200, {
      success: true,
      data: { liked: true },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to like project' });
  }
};
