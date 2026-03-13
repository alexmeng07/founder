const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { S3Client } = require('@aws-sdk/client-s3');

const textract = new TextractClient({});
const bedrock = new BedrockRuntimeClient({});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const MODEL_ID = 'anthropic.claude-sonnet-4-v1:0';

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
    const { s3Key } = body;
    if (!s3Key) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 's3Key required' }),
      };
    }

    const bucket = process.env.S3_BUCKET;
    const { Blocks } = await textract.send(new DetectDocumentTextCommand({
      Document: { S3Object: { Bucket: bucket, Name: s3Key } },
    }));

    const text = (Blocks ?? [])
      .filter(b => b.BlockType === 'LINE')
      .map(b => b.Text)
      .join('\n');

    const prompt = `Extract skills, a 2-sentence bio, and university from this resume text. Return JSON only: { "skills": ["skill1", "skill2"], "bio": "string", "university": "string" }\n\nResume text:\n${text}`;

    const response = await bedrock.send(new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    }));

    const decoded = new TextDecoder().decode(response.body);
    const match = decoded.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : {};

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          skills: parsed.skills ?? [],
          bio: parsed.bio ?? '',
          university: parsed.university ?? '',
        },
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
