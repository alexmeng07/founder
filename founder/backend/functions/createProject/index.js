const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

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
    const ownerId = getUserId(event);
    if (!ownerId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}');
    const { title, description, techStack, rolesNeeded, goal, teamSizeTarget } = body;
    if (!title) {
      return jsonResponse(400, { success: false, error: 'title required' });
    }

    const projectId = randomUUID();
    const now = new Date().toISOString();
    const item = {
      projectId,
      ownerId,
      title,
      description: description || '',
      techStack: Array.isArray(techStack) ? techStack : [],
      rolesNeeded: Array.isArray(rolesNeeded) ? rolesNeeded : [],
      goal: goal || 'startup',
      teamSizeTarget: Math.min(Math.max(parseInt(teamSizeTarget, 10) || 4, 2), 6),
      likesCount: 0,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);
    await doc.send(
      new PutCommand({
        TableName: process.env.PROJECTS_TABLE,
        Item: item,
      })
    );

    return jsonResponse(200, {
      success: true,
      data: { projectId, ...item },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to create project' });
  }
};
