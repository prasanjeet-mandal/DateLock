import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const COLLEGES = [
  { id: 'iitr', name: 'IIT Roorkee', shortName: 'IITR', city: 'Roorkee', type: 'Institute of National Importance', established: 1847 },
  { id: 'coer', name: 'COER University', shortName: 'COER', city: 'Roorkee', type: 'Private University', established: 1999 },
  { id: 'quantum', name: 'Quantum University', shortName: 'Quantum', city: 'Roorkee', type: 'Private University', established: 2008 },
  { id: 'kldav', name: 'KLDAV PG College', shortName: 'KLDAV', city: 'Roorkee', type: 'Government Aided PG College', established: 1960 },
  { id: 'bsm', name: 'BSM PG College', shortName: 'BSM', city: 'Roorkee', type: 'Government Aided PG College', established: 1958 },
  { id: 'rit', name: 'Roorkee Institute of Technology', shortName: 'RIT', city: 'Roorkee', type: 'Engineering College', established: 2005 },
  { id: 'motherhood', name: 'Motherhood University', shortName: 'Motherhood', city: 'Roorkee', type: 'Private University', established: 2015 },
  { id: 'haridwar', name: 'Haridwar University', shortName: 'HU', city: 'Haridwar (Near Roorkee)', type: 'Private University', established: 2010 },
  { id: 'phonics', name: 'Phonics Group of Institutions', shortName: 'Phonics', city: 'Roorkee', type: 'Technical Institute', established: 2009 }
];

export const INTERESTS = [
  { id: 'coding', name: 'Coding & Hackathons', category: 'Tech', icon: 'Code' },
  { id: 'ai', name: 'AI & Robotics', category: 'Tech', icon: 'Cpu' },
  { id: 'indie_music', name: 'Indie & Acoustic', category: 'Music', icon: 'Music' },
  { id: 'rock', name: 'Rock & Metal', category: 'Music', icon: 'Headphones' },
  { id: 'cafe_hopping', name: 'Cafe Hopping', category: 'Lifestyle', icon: 'Coffee' },
  { id: 'street_food', name: 'Roorkee Street Food', category: 'Lifestyle', icon: 'Utensils' },
  { id: 'badminton', name: 'Badminton', category: 'Sports', icon: 'Activity' },
  { id: 'cricket', name: 'Campus Cricket', category: 'Sports', icon: 'Trophy' },
  { id: 'football', name: 'Football', category: 'Sports', icon: 'Circle' },
  { id: 'trekking', name: 'Himalayan Trekking', category: 'Adventure', icon: 'Compass' },
  { id: 'photography', name: 'Aesthetic Photography', category: 'Creative', icon: 'Camera' },
  { id: 'sketching', name: 'Digital Art & Sketching', category: 'Creative', icon: 'Palette' },
  { id: 'anime', name: 'Anime & Manga', category: 'Entertainment', icon: 'Film' },
  { id: 'gaming', name: 'Valorant & BGMI', category: 'Gaming', icon: 'Gamepad2' },
  { id: 'cinema', name: 'World Cinema & Sci-Fi', category: 'Entertainment', icon: 'Clapperboard' },
  { id: 'startups', name: 'Startups & Case Studies', category: 'Academics', icon: 'Lightbulb' },
  { id: 'poetry', name: 'Urdu & Hindi Shayari', category: 'Creative', icon: 'Feather' },
  { id: 'board_games', name: 'Board Games & Chess', category: 'Gaming', icon: 'Puzzle' },
  { id: 'fitness', name: 'Gym & Calisthenics', category: 'Fitness', icon: 'Dumbbell' },
  { id: 'night_walks', name: 'Ganga Canal Night Walks', category: 'Lifestyle', icon: 'Moon' }
];

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80'
];

export async function generateSeedData() {
  const passwordHash = await bcrypt.hash('demo123', 10);

  // 1. Core Users (Students & Admin)
  const users = [
    {
      id: 'usr_admin',
      email: 'admin@demo.com',
      password: passwordHash,
      role: 'admin',
      status: 'active',
      createdAt: '2026-01-01T10:00:00Z'
    },
    {
      id: 'usr_student_1',
      email: 'student1@demo.com',
      password: passwordHash,
      role: 'student',
      status: 'active',
      createdAt: '2026-01-10T11:00:00Z'
    },
    {
      id: 'usr_student_2',
      email: 'student2@demo.com',
      password: passwordHash,
      role: 'student',
      status: 'active',
      createdAt: '2026-01-12T14:30:00Z'
    },
    {
      id: 'usr_student_3',
      email: 'student3@demo.com',
      password: passwordHash,
      role: 'student',
      status: 'active',
      createdAt: '2026-01-15T09:15:00Z'
    }
  ];

  // 2. Profiles for Core Students
  const profiles = [
    {
      userId: 'usr_student_1',
      displayName: 'Aarav Sharma',
      age: 21,
      gender: 'Male',
      collegeId: 'iitr',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      bio: 'Late night hackathon survivor, chai enthusiast at Solani river bank. Looking for someone to jam indie tracks with and explore tech projects!',
      avatarUrl: AVATARS[1],
      avatar3dSeed: 'Aarav-IITR',
      connectionPreference: 'both',
      discoveryScope: 'both',
      discoveryEnabled: true,
      interests: ['coding', 'ai', 'indie_music', 'night_walks', 'cafe_hopping'],
      verificationStatus: 'verified',
      vibePrompt: 'The best spot in Roorkee is definitely the Solani Aqueduct at sunset.'
    },
    {
      userId: 'usr_student_2',
      displayName: 'Ananya Verma',
      age: 20,
      gender: 'Female',
      collegeId: 'coer',
      course: 'B.Tech IT & Cyber Security',
      year: '2nd Year',
      bio: 'Sketching during lectures and trying to beat everyone at Badminton. Big believer in spontaneous midnight Maggi runs.',
      avatarUrl: AVATARS[0],
      avatar3dSeed: 'Ananya-COER',
      connectionPreference: 'dating',
      discoveryScope: 'nearby',
      discoveryEnabled: true,
      interests: ['sketching', 'badminton', 'cafe_hopping', 'cinema', 'indie_music'],
      verificationStatus: 'verified',
      vibePrompt: 'Green flag: You share your playlist without hesitation.'
    },
    {
      userId: 'usr_student_3',
      displayName: 'Rohan Mehra',
      age: 22,
      gender: 'Male',
      collegeId: 'quantum',
      course: 'B.Tech Mechanical Engineering',
      year: '4th Year',
      bio: 'Formula student builder, garage inventor, loves bike rides across Haridwar highway. Let’s connect for road trips or gym sessions!',
      avatarUrl: AVATARS[3],
      avatar3dSeed: 'Rohan-Quantum',
      connectionPreference: 'friendship',
      discoveryScope: 'both',
      discoveryEnabled: true,
      interests: ['fitness', 'cricket', 'gaming', 'startups', 'trekking'],
      verificationStatus: 'verified',
      vibePrompt: 'A non-negotiable for me: Weekend morning workouts.'
    }
  ];

  // 3. Fictional Student Pool across Roorkee colleges (35+ additional realistic profiles)
  const names = [
    { name: 'Diya Singhal', gender: 'Female', college: 'iitr', course: 'B.Arch Architecture', age: 21, year: '3rd Year', pref: 'dating', bio: 'Architecture nerd sketching old Roorkee bungalows. Coffee snob, indie cinephile.' },
    { name: 'Kabir Kapoor', gender: 'Male', college: 'coer', course: 'BCA Cloud Technology', age: 20, year: '2nd Year', pref: 'friendship', bio: 'Valorant player and drone pilot. Building automated IoT stuff in my hostel room.' },
    { name: 'Sneha Joshi', gender: 'Female', college: 'kldav', course: 'B.Sc Biotechnology', age: 20, year: '2nd Year', pref: 'both', bio: 'Plant mom, nature trekker, loves classical fusion beats. Looking for genuine campus friends.' },
    { name: 'Ishaan Gupta', gender: 'Male', college: 'bsm', course: 'B.Com Honours', age: 22, year: '3rd Year', pref: 'dating', bio: 'Finance enthusiast, stock market debater. Looking for someone to explore Roorkee cafes with.' },
    { name: 'Meera Nair', gender: 'Female', college: 'rit', course: 'B.Tech Electrical Eng', age: 21, year: '3rd Year', pref: 'both', bio: 'Robotics team captain. High caffeine tolerance and always down for badminton matches.' },
    { name: 'Aditya Chauhan', gender: 'Male', college: 'motherhood', course: 'B.Sc Agriculture', age: 22, year: '4th Year', pref: 'friendship', bio: 'Loves open fields, sustainable tech, and street food at Civil Lines. Friendly vibes only.' },
    { name: 'Riya Malhotra', gender: 'Female', college: 'haridwar', course: 'BBA Marketing', age: 20, year: '2nd Year', pref: 'dating', bio: 'Fashion enthusiast, social butterfly, loves live music and photography.' },
    { name: 'Tanmay Saxena', gender: 'Male', college: 'phonics', course: 'Polytechnic Diploma Civil', age: 19, year: '1st Year', pref: 'friendship', bio: 'New in Roorkee! Looking for friends to hang out around Ganga Canal and play cricket.' },
    { name: 'Pooja Rawat', gender: 'Female', college: 'iitr', course: 'M.Sc Physics', age: 23, year: '1st Year', pref: 'both', bio: 'Stargazer, quantum mechanics nerd, loves acoustic covers. Catch me at Hangar cafe.' },
    { name: 'Vihaan Agarwal', gender: 'Male', college: 'quantum', course: 'B.Tech AI & Data Science', age: 21, year: '3rd Year', pref: 'both', bio: 'Building neural nets and training for marathon. Love deep late-night conversations.' },
    { name: 'Kavya Pillai', gender: 'Female', college: 'coer', course: 'B.Tech Electronics & Comm', age: 21, year: '3rd Year', pref: 'dating', bio: 'Dance club lead at COER. Spontaneous trips to Rishikesh and foodie explorer.' },
    { name: 'Arjun Rana', gender: 'Male', college: 'kldav', course: 'BA English Literature', age: 21, year: '3rd Year', pref: 'dating', bio: 'Book collector, poet, and acoustic guitarist. Seeking meaningful connection & shared laughs.' },
    { name: 'Simran Walia', gender: 'Female', college: 'bsm', course: 'M.Com Banking', age: 22, year: '1st Year', pref: 'friendship', bio: 'Excel wizard by day, baker by night. Love board games and quiet study sessions.' },
    { name: 'Devendra Bisht', gender: 'Male', college: 'rit', course: 'B.Tech Mechanical', age: 22, year: '4th Year', pref: 'both', bio: 'Off-roading fan, garage DIY enthusiast. Always up for chai near Boat Club.' },
    { name: 'Tara Sen', gender: 'Female', college: 'motherhood', course: 'B.Pharm Pharmacy', age: 20, year: '2nd Year', pref: 'both', bio: 'Future pharmacologist with an obsession for anime and Korean food. Friendly & curious.' },
    { name: 'Yash Vardhan', gender: 'Male', college: 'haridwar', course: 'B.Sc Computer Science', age: 20, year: '2nd Year', pref: 'friendship', bio: 'Competitive coding grind. Let’s team up for hackathons and share memes!' },
    { name: 'Kriti Deshmukh', gender: 'Female', college: 'phonics', course: 'B.Tech Civil Eng', age: 21, year: '3rd Year', pref: 'dating', bio: 'Bridge design fan, love photography and aesthetic street spots around Roorkee.' },
    { name: 'Nikhil Kashyap', gender: 'Male', college: 'iitr', course: 'B.Tech Chemical Eng', age: 21, year: '3rd Year', pref: 'both', bio: 'Dramatics society member, improv comedy lover. Looking for genuine campus souls.' },
    { name: 'Isha Rastogi', gender: 'Female', college: 'quantum', course: 'BBA International Business', age: 20, year: '2nd Year', pref: 'dating', bio: 'Travel enthusiast, loves debating current affairs and trying street chaat at Civil Lines.' },
    { name: 'Samarth Jain', gender: 'Male', college: 'coer', course: 'B.Tech Mechanical Eng', age: 22, year: '4th Year', pref: 'friendship', bio: 'Gym rat, motorcycle lover, big fan of standup comedy. Let’s grab chai and talk cars.' },
    { name: 'Radhika Mittal', gender: 'Female', college: 'kldav', course: 'B.Sc Chemistry', age: 21, year: '3rd Year', pref: 'both', bio: 'Organic chemistry nerd, classical singer. Looking for friends to jam and study with.' },
    { name: 'Akash Tomar', gender: 'Male', college: 'bsm', course: 'BA Economics', age: 21, year: '3rd Year', pref: 'dating', bio: 'Football team captain, love outdoor sports and deep chats over sunset views.' }
  ];

  names.forEach((item, idx) => {
    const userId = `usr_fictional_${idx + 1}`;
    users.push({
      id: userId,
      email: `student_${idx + 4}@demo.com`,
      password: passwordHash,
      role: 'student',
      status: 'active',
      createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString()
    });

    profiles.push({
      userId,
      displayName: item.name,
      age: item.age,
      gender: item.gender,
      collegeId: item.college,
      course: item.course,
      year: item.year,
      bio: item.bio,
      avatarUrl: AVATARS[idx % AVATARS.length],
      avatar3dSeed: `${item.name.replace(/\s+/g, '')}-${item.college}`,
      connectionPreference: item.pref,
      discoveryScope: 'both',
      discoveryEnabled: true,
      interests: [
        INTERESTS[idx % INTERESTS.length].id,
        INTERESTS[(idx + 3) % INTERESTS.length].id,
        INTERESTS[(idx + 7) % INTERESTS.length].id,
        INTERESTS[(idx + 11) % INTERESTS.length].id
      ],
      verificationStatus: idx % 3 === 0 ? 'verified' : (idx % 3 === 1 ? 'pending' : 'not_submitted'),
      vibePrompt: `Can't live without: ${INTERESTS[(idx + 2) % INTERESTS.length].name}`
    });
  });

  // 4. Initial Mutual Matches
  const likes = [
    { fromUserId: 'usr_student_1', toUserId: 'usr_student_2', createdAt: '2026-02-01T12:00:00Z', type: 'like' },
    { fromUserId: 'usr_student_2', toUserId: 'usr_student_1', createdAt: '2026-02-01T12:05:00Z', type: 'like' },
    { fromUserId: 'usr_student_1', toUserId: 'usr_fictional_1', createdAt: '2026-02-02T10:00:00Z', type: 'like' },
    { fromUserId: 'usr_fictional_1', toUserId: 'usr_student_1', createdAt: '2026-02-02T10:30:00Z', type: 'like' },
    { fromUserId: 'usr_student_3', toUserId: 'usr_student_1', createdAt: '2026-02-03T14:00:00Z', type: 'like' }
  ];

  const matches = [
    {
      id: 'match_1',
      users: ['usr_student_1', 'usr_student_2'],
      createdAt: '2026-02-01T12:05:00Z',
      active: true
    },
    {
      id: 'match_2',
      users: ['usr_student_1', 'usr_fictional_1'],
      createdAt: '2026-02-02T10:30:00Z',
      active: true
    }
  ];

  // 5. Preloaded Conversational Messages for Demo with reactions
  const messages = [
    {
      id: 'msg_1',
      matchId: 'match_1',
      senderId: 'usr_student_2',
      receiverId: 'usr_student_1',
      content: 'Hey Aarav! Loved your bio about the Solani aqueduct sunset, it really is the best spot in Roorkee 🙌',
      createdAt: '2026-02-01T12:10:00Z',
      read: true,
      reactions: { usr_student_1: '❤️' }
    },
    {
      id: 'msg_2',
      matchId: 'match_1',
      senderId: 'usr_student_1',
      receiverId: 'usr_student_2',
      content: 'Hey Ananya! Haha totally, especially around 6 PM with chai. How are IT classes treating you at COER?',
      createdAt: '2026-02-01T12:15:00Z',
      read: true,
      reactions: {}
    },
    {
      id: 'msg_3',
      matchId: 'match_1',
      senderId: 'usr_student_2',
      receiverId: 'usr_student_1',
      content: 'Exhausting coding assignments right now! But we have badminton practice later today. Down for a match sometime?',
      createdAt: '2026-02-01T12:20:00Z',
      read: false,
      reactions: {}
    },
    {
      id: 'msg_4',
      matchId: 'match_2',
      senderId: 'usr_fictional_1',
      receiverId: 'usr_student_1',
      content: 'Hey Aarav! What indie songs have you been looping lately?',
      createdAt: '2026-02-02T11:00:00Z',
      read: true,
      reactions: { usr_student_1: '🔥' }
    }
  ];

  // 6. Verification Requests (Simulated)
  const verificationRequests = [
    {
      id: 'req_1',
      userId: 'usr_student_1',
      collegeId: 'iitr',
      studentRollNumber: 'IITR/CS/2023/4012',
      submittedAt: '2026-01-15T10:00:00Z',
      status: 'approved',
      reviewedBy: 'usr_admin',
      reviewedAt: '2026-01-15T14:00:00Z',
      adminNotes: 'Fictional demo record verified successfully.'
    },
    {
      id: 'req_2',
      userId: 'usr_student_2',
      collegeId: 'coer',
      studentRollNumber: 'COER/IT/2024/1109',
      submittedAt: '2026-01-16T12:00:00Z',
      status: 'approved',
      reviewedBy: 'usr_admin',
      reviewedAt: '2026-01-16T15:30:00Z',
      adminNotes: 'Demo student profile verified.'
    },
    {
      id: 'req_3',
      userId: 'usr_fictional_2',
      collegeId: 'coer',
      studentRollNumber: 'COER/BCA/2024/0088',
      submittedAt: '2026-02-03T09:00:00Z',
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      adminNotes: null
    },
    {
      id: 'req_4',
      userId: 'usr_fictional_3',
      collegeId: 'kldav',
      studentRollNumber: 'KLDAV/BIO/2024/302',
      submittedAt: '2026-02-03T11:20:00Z',
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      adminNotes: null
    }
  ];

  // 7. Safety Reports (Simulated Moderation)
  const reports = [
    {
      id: 'rep_1',
      reportedByUserId: 'usr_student_1',
      reportedUserId: 'usr_fictional_7',
      reason: 'Spam or Inappropriate Bio',
      description: 'Demo test: User profile has repetitive promotional links in the bio.',
      status: 'pending',
      createdAt: '2026-02-03T16:00:00Z',
      adminNotes: null
    }
  ];

  // 8. Blocks
  const blocks = [];

  // 9. Notifications (PRD Section 5.8)
  const notifications = [
    {
      id: 'notif_1',
      userId: 'usr_student_1',
      type: 'match',
      title: 'New Mutual Match! 💖',
      message: 'You and Ananya Verma from COER University mutually connected!',
      link: '/messages/match_1',
      read: true,
      createdAt: '2026-02-01T12:05:00Z'
    },
    {
      id: 'notif_2',
      userId: 'usr_student_1',
      type: 'message',
      title: 'New Message from Ananya',
      message: 'Exhausting coding assignments right now! But we have badminton practice...',
      link: '/messages/match_1',
      read: false,
      createdAt: '2026-02-01T12:20:00Z'
    },
    {
      id: 'notif_3',
      userId: 'usr_student_1',
      type: 'verification',
      title: 'Verification Approved! 🎓',
      message: 'Your simulated student badge for IIT Roorkee has been approved.',
      link: '/verification',
      read: true,
      createdAt: '2026-01-15T14:00:00Z'
    },
    {
      id: 'notif_4',
      userId: 'usr_student_2',
      type: 'match',
      title: 'New Mutual Match! 💖',
      message: 'You and Aarav Sharma from IIT Roorkee mutually connected!',
      link: '/messages/match_1',
      read: true,
      createdAt: '2026-02-01T12:05:00Z'
    }
  ];

  // 10. Admin Audit Actions Log (PRD Table 11)
  const adminActions = [
    {
      id: 'act_1',
      adminId: 'usr_admin',
      actionType: 'verification_approved',
      targetType: 'user',
      targetId: 'usr_student_1',
      details: 'Approved simulated verification for IIT Roorkee',
      createdAt: '2026-01-15T14:00:00Z'
    },
    {
      id: 'act_2',
      adminId: 'usr_admin',
      actionType: 'verification_approved',
      targetType: 'user',
      targetId: 'usr_student_2',
      details: 'Approved simulated verification for COER University',
      createdAt: '2026-01-16T15:30:00Z'
    }
  ];

  // Write all to JSON files
  fs.writeFileSync(path.join(DATA_DIR, 'colleges.json'), JSON.stringify(COLLEGES, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'interests.json'), JSON.stringify(INTERESTS, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'profiles.json'), JSON.stringify(profiles, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'likes.json'), JSON.stringify(likes, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'matches.json'), JSON.stringify(matches, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'messages.json'), JSON.stringify(messages, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'verifications.json'), JSON.stringify(verificationRequests, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'reports.json'), JSON.stringify(reports, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'blocks.json'), JSON.stringify(blocks, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'notifications.json'), JSON.stringify(notifications, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'admin_actions.json'), JSON.stringify(adminActions, null, 2));

  console.log('✅ Deterministic Demo Dataset Generated Successfully in', DATA_DIR);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSeedData();
}
