const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const https = require('https');

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

async function fetchFromGitHub(username, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?sort=updated&per_page=6`,
      method: 'GET',
      headers: {
        'User-Agent': 'Founder-Bot',
        Accept: 'application/vnd.github.v3+json',
        ...(token && { Authorization: `token ${token}` }),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(data || `GitHub API error: ${res.statusCode}`));
          return;
        }
        resolve(JSON.parse(data || '[]'));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function getUserId(event) {
  const h = event.headers || {};
  return h['x-mock-user-id'] || h['X-Mock-User-Id'] || event.requestContext?.authorizer?.claims?.sub;
}

exports.handler = async (event) => {
  try {
    const userId = getUserId(event);
    if (!userId) {
      return jsonResponse(401, { success: false, error: 'Unauthorized' });
    }

    const body = JSON.parse(event.body || '{}');
    const { githubUsername } = body;
    if (!githubUsername) {
      return jsonResponse(400, { success: false, error: 'githubUsername required' });
    }

    const token = process.env.GITHUB_API_TOKEN;
    const repos = await fetchFromGitHub(githubUsername, token);
    const repoList = repos.map((r) => ({
      name: r.name,
      description: r.description || '',
      language: r.language || null,
      topics: r.topics || [],
    }));

    const client = new DynamoDBClient();
    const doc = DynamoDBDocumentClient.from(client);
    await doc.send(
      new UpdateCommand({
        TableName: process.env.USERS_TABLE,
        Key: { userId },
        UpdateExpression: 'SET githubUsername = :un, githubRepos = :repos, updatedAt = :now',
        ExpressionAttributeValues: {
          ':un': githubUsername,
          ':repos': repoList,
          ':now': new Date().toISOString(),
        },
      })
    );

    return jsonResponse(200, { success: true, data: { repos: repoList } });
  } catch (err) {
    console.error(err);
    return jsonResponse(500, {
      success: false,
      error: err.message || 'Failed to scrape GitHub',
    });
  }
};
