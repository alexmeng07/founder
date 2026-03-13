const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

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
    const likerId = event.requestContext?.authorizer?.claims?.sub;
    if (!likerId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const projectId = event.pathParameters?.projectId;
    if (!projectId) {
      return jsonResponse(400, { success: false, error: 'projectId required' });
    }

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);

    const { Item: project } = await doc.send(
      new GetCommand({
        TableName: process.env.PROJECTS_TABLE,
        Key: { projectId, ownerId: project.userId },
      })
    );

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

    const sender = process.env.SENDER_EMAIL;
    if (sender && liker && project.ownerId) {
      const { Item: founder } = await doc.send(
        new GetCommand({
          TableName: process.env.USERS_TABLE,
          Key: { userId: project.ownerId },
        })
      );
      if (founder?.email) {
        try {
          await new SESClient().send(
            new SendEmailCommand({
              Source: sender,
              Destination: { ToAddresses: [founder.email] },
              Message: {
                Subject: { Data: `Someone liked "${project.title}" on Founder` },
                Body: {
                  Text: {
                    Data: `${liker.name || 'A builder'} is interested in your project "${project.title}". Check Founder to connect!`,
                  },
                },
              },
            })
          );
        } catch (e) {
          console.warn('SES send failed:', e.message);
        }
      }
    }

    return jsonResponse(200, {
      success: true,
      data: { liked: true },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to like project' });
  }
};
