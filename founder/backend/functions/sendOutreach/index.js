const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

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
    const fromUserId = event.requestContext?.authorizer?.claims?.sub;
    if (!fromUserId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}');
    const { toUserId, toEmail: toEmailDirect, body: emailBody } = body;
    if (!emailBody) {
      return jsonResponse(400, { success: false, error: 'body required' });
    }

    let toEmail = toEmailDirect;
    if (!toEmail && toUserId && process.env.USERS_TABLE) {
      const doc = DynamoDBDocumentClient.from(new DynamoDBClient());
      const { Item } = await doc.send(
        new GetCommand({
          TableName: process.env.USERS_TABLE,
          Key: { userId: toUserId },
          ProjectionExpression: 'email',
        })
      );
      toEmail = Item?.email;
    }
    if (!toEmail) {
      return jsonResponse(400, { success: false, error: 'Recipient email not found' });
    }

    const ses = new SESClient();
    const sender = process.env.SENDER_EMAIL;
    if (!sender) {
      return jsonResponse(500, { success: false, error: 'SENDER_EMAIL not configured' });
    }

    await ses.send(
      new SendEmailCommand({
        Source: sender,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: { Data: subject || 'Message from Founder' },
          Body: {
            Text: { Data: emailBody },
          },
        },
        ReplyToAddresses: [sender],
        Source: sender,
        Destination: { ToAddresses: [toEmail] },
        Message: {
          Subject: { Data: body.subject || 'Message from Founder' },
          Body: { Text: { Data: emailBody } },
        },
      })
    );

    return jsonResponse(200, {
      success: true,
      data: { sent: true },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, { success: false, error: err.message || 'Failed to send email' });
  }
};
