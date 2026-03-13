const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  try {
    const claims = event.requestContext?.authorizer?.claims;
    if (!claims?.sub) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Unauthorized' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const userId = claims.sub;
    const now = new Date().toISOString();

    const item = {
      userId,
      name: body.name ?? '',
      email: claims.email ?? body.email ?? '',
      bio: body.bio ?? '',
      university: body.university ?? '',
      graduationYear: body.graduationYear ?? null,
      userType: body.userType ?? 'builder',
      skills: body.skills ?? [],
      interests: body.interests ?? [],
      githubUsername: body.githubUsername ?? '',
      githubRepos: body.githubRepos ?? [],
      linkedinUrl: body.linkedinUrl ?? '',
      devpostUrl: body.devpostUrl ?? '',
      instagramHandle: body.instagramHandle ?? '',
      discordHandle: body.discordHandle ?? '',
      avatarS3Key: body.avatarS3Key ?? '',
      resumeS3Key: body.resumeS3Key ?? '',
      createdAt: body.createdAt ?? now,
      updatedAt: now,
    };

    await doc.send(new PutCommand({
      TableName: process.env.USERS_TABLE,
      Item: item,
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, data: item }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
