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

function conversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

exports.handler = async (event) => {
  try {
    const senderId = getUserId(event);
    if (!senderId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}');
    const { to: recipientId, type, text, profile } = body;
    if (!recipientId) {
      return jsonResponse(400, { success: false, error: 'to (recipient userId) required' });
    }

    const msgType = type || 'text';
    if (msgType === 'text' && !text) {
      return jsonResponse(400, { success: false, error: 'text required for text message' });
    }
    if (msgType === 'profile' && !profile) {
      return jsonResponse(400, { success: false, error: 'profile required for profile message' });
    }

    const messageId = randomUUID();
    const now = new Date().toISOString();
    const convId = conversationId(senderId, recipientId);

    const item = {
      conversationId: convId,
      messageId,
      senderId,
      recipientId,
      type: msgType,
      text: msgType === 'text' ? text : undefined,
      profile: msgType === 'profile' ? profile : undefined,
      createdAt: now,
    };

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);
    await doc.send(
      new PutCommand({
        TableName: process.env.MESSAGES_TABLE,
        Item: item,
      })
    );

    return jsonResponse(200, {
      success: true,
      data: {
        messageId,
        from: 'me',
        type: msgType,
        text,
        profile,
        time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to send message' });
  }
};
