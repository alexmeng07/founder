const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

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

const MODEL_ID = 'us.anthropic.claude-sonnet-4-20250514-v1:0';

function getUserId(event) {
  const h = event.headers || {};
  return h['x-mock-user-id'] || h['X-Mock-User-Id'] || event.requestContext?.authorizer?.claims?.sub;
}

exports.handler = async (event) => {
  try {
    const fromUserId = getUserId(event);
    if (!fromUserId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}');
    const { toUserId } = body;
    if (!toUserId) {
      return jsonResponse(400, { success: false, error: 'toUserId required' });
    }

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);

    const [{ Item: fromUser }, { Item: toUser }] = await Promise.all([
      doc.send(new GetCommand({ TableName: process.env.USERS_TABLE, Key: { userId: fromUserId } })),
      doc.send(new GetCommand({ TableName: process.env.USERS_TABLE, Key: { userId: toUserId } })),
    ]);

    if (!fromUser || !toUser) {
      return jsonResponse(404, { success: false, error: 'User not found' });
    }

    const fromName = fromUser.name || 'Someone';
    const toName = toUser.name || 'them';
    const fromSkills = (fromUser.skills || []).slice(0, 5).join(', ') || 'tech';
    const toSkills = (toUser.skills || []).slice(0, 5).join(', ') || 'tech';

    const prompt = `Draft a short (4-5 sentence), casual but compelling cold outreach message from ${fromName} (skills: ${fromSkills}) to ${toName} (skills: ${toSkills}) about collaborating on a tech project. Make it sound like a real student, not a recruiter. Return only the email body, no subject.`;

    const bedrock = new BedrockRuntimeClient();
    const modelId = process.env.BEDROCK_MODEL_ID || MODEL_ID;
    const region = process.env.AWS_REGION || 'us-east-1';
    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const draft = responseBody.content?.[0]?.text?.trim() || 'Hi! I noticed we both work on similar things. Would love to connect and explore collaborating sometime.';

    return jsonResponse(200, {
      success: true,
      data: { draft },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to compose email' });
  }
};
