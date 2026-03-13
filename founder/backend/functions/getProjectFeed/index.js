const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

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

exports.handler = async (event) => {
  try {
    const limit = Math.min(parseInt(event.queryStringParameters?.limit || '20', 10), 50);
    const lastKey = event.queryStringParameters?.lastKey
      ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
      : null;

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);

    const { Items: projects, LastEvaluatedKey } = await doc.send(
      new QueryCommand({
        TableName: process.env.PROJECTS_TABLE,
        IndexName: 'StatusIndex',
        KeyConditionExpression: '#st = :open',
        ExpressionAttributeNames: { '#st': 'status' },
        ExpressionAttributeValues: { ':open': 'open' },
        Limit: limit,
        ScanIndexForward: false,
        ExclusiveStartKey: lastKey,
      })
    );

    const enriched = await Promise.all(
      (projects || []).map(async (p) => {
        let owner = {};
        if (p.ownerId) {
          const { Item } = await doc.send(
            new GetCommand({
              TableName: process.env.USERS_TABLE,
              Key: { userId: p.ownerId },
              ProjectionExpression: 'name, avatarS3Key',
            })
          );
          owner = Item || {};
        }
        return {
          projectId: p.projectId,
          ownerId: p.ownerId,
          title: p.title,
          description: p.description,
          techStack: p.techStack || [],
          rolesNeeded: p.rolesNeeded || [],
          goal: p.goal || 'startup',
          teamSizeTarget: p.teamSizeTarget ?? 4,
          likesCount: p.likesCount ?? 0,
          status: p.status || 'open',
          createdAt: p.createdAt,
          ownerName: owner.name || 'Unknown',
          ownerAvatarS3Key: owner.avatarS3Key || null,
        };
      })
    );

    const nextKey = LastEvaluatedKey ? encodeURIComponent(JSON.stringify(LastEvaluatedKey)) : null;
    return jsonResponse(200, {
      success: true,
      data: { projects: enriched, nextKey },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to get project feed' });
  }
};
