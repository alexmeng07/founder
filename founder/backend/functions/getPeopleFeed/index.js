const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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
    const swiperId = event.requestContext?.authorizer?.claims?.sub || event.queryStringParameters?.userId;
    const limit = Math.min(parseInt(event.queryStringParameters?.limit || '20', 10), 50);
    const lastKey = event.queryStringParameters?.lastKey ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey)) : null;

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);

    const { Items: swiped } = swiperId
      ? await doc.send(
          new QueryCommand({
            TableName: process.env.SWIPES_TABLE,
            KeyConditionExpression: 'swiperId = :sid',
            ExpressionAttributeValues: { ':sid': swiperId },
            ProjectionExpression: 'swipeeId',
          })
        )
      : { Items: [] };
    const swipeeIds = new Set((swiped || []).map((s) => s.swipeeId));

    const { Items: users } = await doc.send(
      new ScanCommand({
        TableName: process.env.USERS_TABLE,
        Limit: limit * 2,
        ExclusiveStartKey: lastKey,
      })
    );

    const filtered = (users || [])
      .filter((u) => u.userId !== swiperId && !swipeeIds.has(u.userId))
      .slice(0, limit)
      .map((u) => {
        const { userId, name, email, bio, university, graduationYear, userType, skills, interests, githubUsername, githubRepos, linkedinUrl, devpostUrl, instagramHandle, discordHandle, avatarS3Key } = u;
        return {
          userId,
          name: name || 'Anonymous',
          bio: bio || '',
          university: university || '',
          graduationYear: graduationYear || '',
          userType: userType || 'builder',
          skills: skills || [],
          interests: interests || [],
          githubUsername: githubUsername || null,
          githubRepos: githubRepos || [],
          linkedinUrl: linkedinUrl || null,
          devpostUrl: devpostUrl || null,
          instagramHandle: instagramHandle || null,
          discordHandle: discordHandle || null,
          avatarS3Key: avatarS3Key || null,
        };
      });

    const last = users?.length >= limit * 2 ? users[limit * 2 - 1] : null;
    const nextKey = last ? { userId: last.userId } : null;
    return jsonResponse(200, {
      success: true,
      data: { users: filtered, nextKey: nextKey ? encodeURIComponent(JSON.stringify(nextKey)) : null },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to get feed' });
  }
};
