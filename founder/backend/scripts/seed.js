/**
 * Seed demo data: 20 profiles (UofT) + 10 projects.
 * Run: cd backend && npm install && FOUNDER_STAGE=dev node scripts/seed.js
 * Requires AWS credentials and deployed stack (founder-dev-Users, founder-dev-Projects).
 */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const Stage = process.env.FOUNDER_STAGE || 'dev';
const region = process.env.AWS_REGION || 'us-east-1';
const USERS_TABLE = `founder-${Stage}-Users`;
const PROJECTS_TABLE = `founder-${Stage}-Projects`;

const client = new DynamoDBClient({ region });
const doc = DynamoDBDocumentClient.from(client);

const PROFILES = [
  // Researchers (7) — different fields
  {
    userId: 'seed-researcher-ai-01',
    name: 'Dr. Maya Chen',
    email: 'maya.chen@utoronto.ca',
    bio: 'AI/ML researcher. Building interpretable deep learning for healthcare.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'researcher',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'ML', 'NLP'],
    interests: ['healthcare AI', 'explainability'],
  },
  {
    userId: 'seed-researcher-hci-02',
    name: 'Dr. James Okonkwo',
    email: 'j.okonkwo@utoronto.ca',
    bio: 'HCI researcher. AR/VR for accessibility.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'researcher',
    skills: ['React', 'Unity', 'C#', 'UX Research', 'Figma'],
    interests: ['accessibility', 'spatial computing'],
  },
  {
    userId: 'seed-researcher-systems-03',
    name: 'Dr. Sofia Rossi',
    email: 's.rossi@utoronto.ca',
    bio: 'Systems researcher. Distributed systems and fault tolerance.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'researcher',
    skills: ['Go', 'Rust', 'Kubernetes', 'gRPC'],
    interests: ['distributed systems', 'consensus'],
  },
  {
    userId: 'seed-researcher-security-04',
    name: 'Dr. Vikram Patel',
    email: 'v.patel@utoronto.ca',
    bio: 'Security researcher. Formal verification and cryptanalysis.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'researcher',
    skills: ['C', 'Haskell', 'Cryptography', 'Z3'],
    interests: ['formal methods', 'privacy'],
  },
  {
    userId: 'seed-researcher-nlp-05',
    name: 'Dr. Emma Zhang',
    email: 'e.zhang@utoronto.ca',
    bio: 'NLP researcher. Low-resource language models.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'researcher',
    skills: ['Python', 'Transformers', 'HuggingFace', 'AWS'],
    interests: ['multilingual NLP', 'efficiency'],
  },
  {
    userId: 'seed-researcher-vis-06',
    name: 'Dr. Lucas Bergstrom',
    email: 'l.bergstrom@utoronto.ca',
    bio: 'Visualization researcher. Data storytelling for science.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'researcher',
    skills: ['D3.js', 'WebGL', 'Python', 'Pandas'],
    interests: ['scientific viz', 'interactive dashboards'],
  },
  {
    userId: 'seed-researcher-robotics-07',
    name: 'Dr. Yuki Tanaka',
    email: 'y.tanaka@utoronto.ca',
    bio: 'Robotics researcher. Manipulation and sim-to-real transfer.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'researcher',
    skills: ['C++', 'ROS', 'Python', 'OpenCV'],
    interests: ['manipulation', 'reinforcement learning'],
  },
  // Professors (7)
  {
    userId: 'seed-prof-cs-01',
    name: 'Prof. Michael Foster',
    email: 'm.foster@utoronto.ca',
    bio: 'CS faculty. Databases and information systems.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'professor',
    skills: ['SQL', 'PostgreSQL', 'Scala', 'Spark'],
    interests: ['query optimization', 'data management'],
  },
  {
    userId: 'seed-prof-eng-02',
    name: 'Prof. Ana Costa',
    email: 'a.costa@utoronto.ca',
    bio: 'ECE faculty. Embedded systems and IoT.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'professor',
    skills: ['C', 'Verilog', 'RTOS', 'ARM'],
    interests: ['embedded', 'energy-efficient computing'],
  },
  {
    userId: 'seed-prof-ds-03',
    name: 'Prof. David Kim',
    email: 'd.kim@utoronto.ca',
    bio: 'Data science faculty. Statistical learning.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'professor',
    skills: ['R', 'Python', 'Statistics', 'Jupyter'],
    interests: ['causal inference', 'Bayesian methods'],
  },
  {
    userId: 'seed-prof-hci-04',
    name: 'Prof. Nadia Ahmed',
    email: 'n.ahmed@utoronto.ca',
    bio: 'HCI faculty. Participatory design and accessibility.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'professor',
    skills: ['JavaScript', 'Qualitative methods', 'Prototyping'],
    interests: ['inclusive design', 'community tech'],
  },
  {
    userId: 'seed-prof-ml-05',
    name: 'Prof. Robert Liu',
    email: 'r.liu@utoronto.ca',
    bio: 'ML faculty. Optimization and theory.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'professor',
    skills: ['Python', 'NumPy', 'Julia', 'Convex optimization'],
    interests: ['optimization', 'deep learning theory'],
  },
  {
    userId: 'seed-prof-swe-06',
    name: 'Prof. Lisa Wang',
    email: 'l.wang@utoronto.ca',
    bio: 'Software engineering faculty. DevOps and reliability.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'professor',
    skills: ['Git', 'Docker', 'CI/CD', 'Node.js'],
    interests: ['SRE', 'testing', 'maintainability'],
  },
  {
    userId: 'seed-prof-net-07',
    name: 'Prof. Carlos Mendez',
    email: 'c.mendez@utoronto.ca',
    bio: 'Networks faculty. Distributed systems and protocol design.',
    university: 'University of Toronto',
    graduationYear: null,
    userType: 'professor',
    skills: ['Go', 'Protocol buffers', 'Linux', 'Networking'],
    interests: ['P2P', 'content delivery', 'congestion control'],
  },
  // Students (6)
  {
    userId: 'seed-student-swe-01',
    name: 'Alex Thompson',
    email: 'alex.t@mail.utoronto.ca',
    bio: 'Third-year CS. Full-stack and mobile.',
    university: 'University of Toronto',
    graduationYear: '2026',
    userType: 'student',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    interests: ['web dev', 'startups'],
  },
  {
    userId: 'seed-student-ml-02',
    name: 'Priya Sharma',
    email: 'priya.s@mail.utoronto.ca',
    bio: 'MSc ML. Computer vision and edge deployment.',
    university: 'University of Toronto',
    graduationYear: '2025',
    userType: 'student',
    skills: ['Python', 'PyTorch', 'ONNX', 'TensorRT'],
    interests: ['CV', 'model compression'],
  },
  {
    userId: 'seed-student-devops-03',
    name: 'Jordan Lee',
    email: 'jordan.l@mail.utoronto.ca',
    bio: 'Fourth-year CE. DevOps and infra.',
    university: 'University of Toronto',
    graduationYear: '2025',
    userType: 'student',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'Python'],
    interests: ['cloud', 'observability'],
  },
  {
    userId: 'seed-student-design-04',
    name: 'Samira Hassan',
    email: 'samira.h@mail.utoronto.ca',
    bio: 'UX design + CS minor. Product and prototyping.',
    university: 'University of Toronto',
    graduationYear: '2026',
    userType: 'student',
    skills: ['Figma', 'React', 'Framer', 'User research'],
    interests: ['product design', 'design systems'],
  },
  {
    userId: 'seed-student-backend-05',
    name: 'Marcus Johnson',
    email: 'marcus.j@mail.utoronto.ca',
    bio: 'Third-year ECE. Backend and databases.',
    university: 'University of Toronto',
    graduationYear: '2026',
    userType: 'student',
    skills: ['Java', 'Spring Boot', 'MongoDB', 'Redis'],
    interests: ['scalability', 'APIs'],
  },
  {
    userId: 'seed-student-security-06',
    name: 'Wei Zhang',
    email: 'wei.z@mail.utoronto.ca',
    bio: 'MSc Security. Pen testing and secure coding.',
    university: 'University of Toronto',
    graduationYear: '2025',
    userType: 'student',
    skills: ['Python', 'Burp Suite', 'Solidity', 'Linux'],
    interests: ['web3 security', 'CTFs'],
  },
];

const PROJECTS = [
  {
    title: 'AI-Powered Study Companion',
    description: 'LLM-based app that generates personalized flashcards and practice questions from lecture notes. Target: students and educators.',
    techStack: ['React', 'Python', 'FastAPI', 'OpenAI API'],
    rolesNeeded: ['frontend', 'ML engineer'],
    goal: 'startup',
    teamSizeTarget: 4,
    ownerId: 'seed-researcher-ai-01',
  },
  {
    title: 'Distributed Task Queue for Edge',
    description: 'Lightweight, fault-tolerant task queue for edge devices. Eventual consistency with conflict resolution.',
    techStack: ['Rust', 'gRPC', 'SQLite'],
    rolesNeeded: ['systems engineer', 'devops'],
    goal: 'research',
    teamSizeTarget: 3,
    ownerId: 'seed-researcher-systems-03',
  },
  {
    title: 'AR Navigation for Visually Impaired',
    description: 'Spatial audio and haptic feedback for indoor navigation. Research-backed accessibility design.',
    techStack: ['Unity', 'C#', 'ARKit', 'Core Haptics'],
    rolesNeeded: ['Unity dev', 'UX researcher'],
    goal: 'research',
    teamSizeTarget: 3,
    ownerId: 'seed-researcher-hci-02',
  },
  {
    title: 'Privacy-Preserving Contact Tracing',
    description: 'Decentralized contact tracing using differential privacy. No central server, on-device matching.',
    techStack: ['Kotlin', 'Swift', 'Differential privacy libs'],
    rolesNeeded: ['mobile dev', 'privacy engineer'],
    goal: 'startup',
    teamSizeTarget: 4,
    ownerId: 'seed-researcher-security-04',
  },
  {
    title: 'Low-Code Dashboard Builder',
    description: 'Drag-and-drop dashboards that connect to any REST API. Export to static HTML or deploy to cloud.',
    techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    rolesNeeded: ['full-stack', 'designer'],
    goal: 'startup',
    teamSizeTarget: 5,
    ownerId: 'seed-student-swe-01',
  },
  {
    title: 'Multilingual Document Summarizer',
    description: 'Summarize long documents in 100+ languages. Optimized for low-resource languages.',
    techStack: ['Python', 'HuggingFace', 'FastAPI', 'Docker'],
    rolesNeeded: ['NLP engineer', 'backend'],
    goal: 'research',
    teamSizeTarget: 3,
    ownerId: 'seed-researcher-nlp-05',
  },
  {
    title: 'Real-Time Scientific Visualization',
    description: 'Web-based tool for 3D molecular and flow visualizations. Works on desktop and tablets.',
    techStack: ['Three.js', 'WebGL', 'Python backend'],
    rolesNeeded: ['frontend/graphics', 'scientist liaison'],
    goal: 'research',
    teamSizeTarget: 4,
    ownerId: 'seed-researcher-vis-06',
  },
  {
    title: 'Sim-to-Real Robot Grasping',
    description: 'Train grasp policies in simulation, deploy on real arm. Domain randomization and RL.',
    techStack: ['PyTorch', 'Isaac Gym', 'ROS', 'C++'],
    rolesNeeded: ['ML engineer', 'robotics'],
    goal: 'research',
    teamSizeTarget: 3,
    ownerId: 'seed-researcher-robotics-07',
  },
  {
    title: 'Campus Event Discovery',
    description: 'Aggregate events from UofT clubs, depts, and external orgs. Filters, calendar export, recommendations.',
    techStack: ['Next.js', 'PostgreSQL', 'Redis', 'Scraping'],
    rolesNeeded: ['full-stack', 'designer'],
    goal: 'hackathon',
    teamSizeTarget: 4,
    ownerId: 'seed-student-design-04',
  },
  {
    title: 'Decentralized Identity for Students',
    description: 'Self-sovereign student credentials (transcripts, badges) on a lightweight chain. Verifiable credentials.',
    techStack: ['Solidity', 'IPFS', 'React', 'Node.js'],
    rolesNeeded: ['blockchain', 'frontend'],
    goal: 'startup',
    teamSizeTarget: 5,
    ownerId: 'seed-student-security-06',
  },
];

async function seed() {
  const now = new Date().toISOString();

  console.log(`Seeding ${USERS_TABLE} and ${PROJECTS_TABLE} (Stage=${Stage})...`);

  for (const p of PROFILES) {
    const item = {
      userId: p.userId,
      name: p.name,
      email: p.email,
      bio: p.bio,
      university: p.university,
      graduationYear: p.graduationYear ?? null,
      userType: p.userType,
      skills: p.skills || [],
      interests: p.interests || [],
      githubUsername: '',
      githubRepos: [],
      linkedinUrl: '',
      devpostUrl: '',
      instagramHandle: '',
      discordHandle: '',
      avatarS3Key: '',
      resumeS3Key: '',
      createdAt: now,
      updatedAt: now,
    };
    await doc.send(new PutCommand({ TableName: USERS_TABLE, Item: item }));
    console.log(`  User: ${p.name}`);
  }

  for (const p of PROJECTS) {
    const projectId = `seed-proj-${Math.random().toString(36).slice(2, 10)}`;
    const item = {
      projectId,
      ownerId: p.ownerId,
      title: p.title,
      description: p.description,
      techStack: p.techStack || [],
      rolesNeeded: p.rolesNeeded || [],
      goal: p.goal || 'startup',
      teamSizeTarget: p.teamSizeTarget ?? 4,
      likesCount: 0,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    await doc.send(new PutCommand({ TableName: PROJECTS_TABLE, Item: item }));
    console.log(`  Project: ${p.title}`);
  }

  console.log('Done. 20 profiles + 10 projects seeded.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
