const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const s3 = new S3Client({});
const ddb = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(ddb);

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

    const userId = claims.sub;
    const type = event.queryStringParameters?.type ?? 'avatar';
    const ext = event.queryStringParameters?.ext ?? (type === 'resume' ? 'pdf' : 'jpg');
    const folder = type === 'resume' ? 'resumes' : 'avatars';
    const s3Key = `${folder}/${userId}/${randomUUID()}.${ext}`;
    const contentTypeMap = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
    const contentType = event.queryStringParameters?.contentType ?? contentTypeMap[ext] ?? 'application/octet-stream';

    const url = await getSignedUrl(s3, new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      ContentType: contentType,
    }), { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: { uploadUrl: url, s3Key },
      }),
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
