const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
    const myId = getUserId(event);
    if (!myId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const withUserId = event.queryStringParameters?.with;
    const isConversations = !withUserId;

    if (isConversations) {
      const client = new DynamoDBClient();
      const doc = DynamoDBDocumentClient.from(client);
      const { Items } = await doc.send(
        new ScanCommand({
          TableName: process.env.MESSAGES_TABLE,
          FilterExpression: 'senderId = :uid OR recipientId = :uid',
          ExpressionAttributeValues: { ':uid': myId },
        })
      );

      const byPartner = {};
      for (const m of Items || []) {
        const partnerId = m.senderId === myId ? m.recipientId : m.senderId;
        const existing = byPartner[partnerId];
        const createdAt = m.createdAt || '';
        if (!existing || createdAt > (existing.createdAt || '')) {
          byPartner[partnerId] = {
            userId: partnerId,
            lastMessage: m.type === 'profile' ? 'Profile shared' : m.text,
            lastTime: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            createdAt,
          };
        }
      }
      const conversations = Object.values(byPartner).sort(
        (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')
      );
      return jsonResponse(200, { success: true, data: { conversations } });
    }

    const convId = conversationId(myId, withUserId);
    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);

    const { Items } = await doc.send(
      new QueryCommand({
        TableName: process.env.MESSAGES_TABLE,
        KeyConditionExpression: 'conversationId = :cid',
        ExpressionAttributeValues: { ':cid': convId },
      })
    );

    const messages = (Items || [])
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
      .map((m) => ({
        id: m.messageId,
        from: m.senderId === myId ? 'me' : 'them',
        type: m.type || 'text',
        text: m.text,
        profile: m.profile,
        time: m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
      }));

    return jsonResponse(200, { success: true, data: { messages } });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to get messages' });
  }
};
