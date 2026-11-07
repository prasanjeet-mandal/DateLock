import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSeedData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

function readFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
}

function writeFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export class Database {
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    const requiredFiles = ['users.json', 'profiles.json', 'colleges.json', 'interests.json'];
    const missing = requiredFiles.some(f => !fs.existsSync(path.join(DATA_DIR, f)));
    if (missing) {
      console.log('⚡ Initializing database with seed data...');
      generateSeedData();
    }
  }

  // --- Reset Database ---
  async reset() {
    await generateSeedData();
    return { success: true, message: 'Database reset to seed data' };
  }

  // --- Colleges & Interests ---
  getColleges() {
    return readFile('colleges.json');
  }

  getCollegeById(id) {
    return this.getColleges().find(c => c.id === id);
  }

  getInterests() {
    return readFile('interests.json');
  }

  // --- Users ---
  getUsers() {
    return readFile('users.json');
  }

  findUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user) {
    const users = this.getUsers();
    users.push(user);
    writeFile('users.json', users);
    return user;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
    writeFile('users.json', users);
    return users[idx];
  }

  deleteUser(id) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    writeFile('users.json', users);
    return true;
  }

  // --- Profiles ---
  getProfiles() {
    return readFile('profiles.json');
  }

  findProfileByUserId(userId) {
    const profiles = this.getProfiles();
    const profile = profiles.find(p => p.userId === userId);
    if (!profile) return null;

    const college = this.getCollegeById(profile.collegeId);
    return {
      ...profile,
      college: college || { id: profile.collegeId, name: 'Unknown College' }
    };
  }

  upsertProfile(userId, profileData) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.userId === userId);
    const existing = idx >= 0 ? profiles[idx] : {};
    const updated = {
      ...existing,
      ...profileData,
      userId,
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      profiles[idx] = updated;
    } else {
      profiles.push(updated);
    }
    writeFile('profiles.json', profiles);
    return this.findProfileByUserId(userId);
  }

  // --- Discovery Candidates with Smart Compatibility Scoring & Campus Proximity ---
  getDiscoveryCandidates(currentUserId, filters = {}) {
    const allProfiles = this.getProfiles();
    const currentUserProfile = allProfiles.find(p => p.userId === currentUserId);
    const userCollege = currentUserProfile ? this.getCollegeById(currentUserProfile.collegeId) : null;
    const blockedIds = this.getBlockedUserIds(currentUserId);
    const userLikes = this.getLikes().filter(l => l.fromUserId === currentUserId);
    const interactedUserIds = new Set(userLikes.map(l => l.toUserId));

    const currentUserInterests = new Set(currentUserProfile?.interests || []);

    const eligible = allProfiles
      .filter(p => {
        if (p.userId === currentUserId) return false;
        if (blockedIds.includes(p.userId)) return false;
        if (p.discoveryEnabled === false) return false;
        if (interactedUserIds.has(p.userId)) return false;

        const candidateCollege = this.getCollegeById(p.collegeId);

        // Mode filter
        if (filters.mode && filters.mode !== 'both') {
          if (p.connectionPreference !== 'both' && p.connectionPreference !== filters.mode) {
            return false;
          }
        }

        // College filter
        if (filters.collegeId) {
          if (p.collegeId !== filters.collegeId) return false;
        }

        // Scope filter: Anchors to the student's selected college location!
        if (filters.scope === 'same_college' && currentUserProfile) {
          if (p.collegeId !== currentUserProfile.collegeId) return false;
        } else if (filters.scope === 'nearby' && currentUserProfile) {
          // Must not be the exact same college
          if (p.collegeId === currentUserProfile.collegeId) return false;
          // If user college has a city, anchor nearby search to campuses in the same city/region
          if (userCollege?.city && candidateCollege?.city && userCollege.city !== candidateCollege.city) {
            return false;
          }
        }

        // Academic year filter
        if (filters.year && p.year !== filters.year) {
          return false;
        }

        // Interest filter
        if (filters.interest && Array.isArray(p.interests)) {
          if (!p.interests.includes(filters.interest)) return false;
        }

        return true;
      })
      .map(p => {
        const candidateCollege = this.getCollegeById(p.collegeId);

        // Calculate Smart Compatibility Score (0 - 100)
        let compatibilityScore = 50; // base score

        // Shared interests: +12 points per shared interest (up to 36)
        const candidateInterests = Array.isArray(p.interests) ? p.interests : [];
        const sharedInterests = candidateInterests.filter(i => currentUserInterests.has(i));
        compatibilityScore += sharedInterests.length * 12;

        // Proximity Anchor: Same college bonus (+18 points)
        if (currentUserProfile && p.collegeId === currentUserProfile.collegeId) {
          compatibilityScore += 18;
        } else if (userCollege?.city && candidateCollege?.city && userCollege.city === candidateCollege.city) {
          // Nearby college in the same campus city cluster (+10 points)
          compatibilityScore += 10;
        }

        // Exact connection preference match: +10 points
        if (currentUserProfile && p.connectionPreference === currentUserProfile.connectionPreference) {
          compatibilityScore += 10;
        }

        // Verified profile bonus: +8 points
        if (p.verificationStatus === 'verified') {
          compatibilityScore += 8;
        }

        compatibilityScore = Math.min(99, Math.max(30, compatibilityScore));

        return {
          ...p,
          college: candidateCollege || { id: p.collegeId, name: 'Unknown College' },
          compatibilityScore,
          sharedInterestsCount: sharedInterests.length
        };
      });

    // Sorting
    if (filters.sortBy === 'newest') {
      eligible.reverse();
    } else {
      // Default: sort by highest compatibility score
      eligible.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }

    return eligible;
  }

  // --- Likes & Matching ---
  getLikes() {
    return readFile('likes.json');
  }

  addLike(fromUserId, toUserId, type = 'like') {
    const likes = this.getLikes();
    const filtered = likes.filter(l => !(l.fromUserId === fromUserId && l.toUserId === toUserId));
    const newLike = {
      fromUserId,
      toUserId,
      type,
      createdAt: new Date().toISOString()
    };
    filtered.push(newLike);
    writeFile('likes.json', filtered);

    if (type === 'pass') {
      return { like: newLike, isMatch: false };
    }

    // Check reciprocal like
    const reciprocalLike = filtered.find(l => l.fromUserId === toUserId && l.toUserId === fromUserId && l.type === 'like');

    if (reciprocalLike) {
      const match = this.createMatch(fromUserId, toUserId);

      // Create Mutual Match Notifications for both students!
      const userAProfile = this.findProfileByUserId(fromUserId);
      const userBProfile = this.findProfileByUserId(toUserId);

      this.createNotification({
        userId: fromUserId,
        type: 'match',
        title: 'New Mutual Match! 💖',
        message: `You and ${userBProfile?.displayName || 'a student'} from ${userBProfile?.college?.name || 'campus'} mutually connected!`,
        link: `/messages/${match.id}`,
        data: { matchId: match.id, partnerId: toUserId }
      });

      this.createNotification({
        userId: toUserId,
        type: 'match',
        title: 'New Mutual Match! 💖',
        message: `You and ${userAProfile?.displayName || 'a student'} from ${userAProfile?.college?.name || 'campus'} mutually connected!`,
        link: `/messages/${match.id}`,
        data: { matchId: match.id, partnerId: fromUserId }
      });

      return { like: newLike, isMatch: true, match };
    }

    return { like: newLike, isMatch: false };
  }

  undoLastAction(fromUserId) {
    const likes = this.getLikes();
    const userLikes = likes.filter(l => l.fromUserId === fromUserId);
    if (userLikes.length === 0) return null;

    const lastLike = userLikes[userLikes.length - 1];
    const updated = likes.filter(l => !(l.fromUserId === fromUserId && l.toUserId === lastLike.toUserId));
    writeFile('likes.json', updated);

    if (lastLike.type === 'like') {
      const match = this.findMatchBetween(fromUserId, lastLike.toUserId);
      if (match) {
        this.unmatch(match.id);
      }
    }

    return { undoneUserId: lastLike.toUserId, type: lastLike.type };
  }

  // --- Matches ---
  getMatches() {
    return readFile('matches.json');
  }

  findMatchBetween(userA, userB) {
    return this.getMatches().find(m => m.active && m.users.includes(userA) && m.users.includes(userB));
  }

  createMatch(userA, userB) {
    const existing = this.findMatchBetween(userA, userB);
    if (existing) return existing;

    const matches = this.getMatches();
    const newMatch = {
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      users: [userA, userB],
      createdAt: new Date().toISOString(),
      active: true
    };
    matches.push(newMatch);
    writeFile('matches.json', matches);
    return newMatch;
  }

  getMatchesForUser(userId) {
    const matches = this.getMatches().filter(m => m.active && m.users.includes(userId));
    const allProfiles = this.getProfiles();
    const colleges = this.getColleges();
    const allMessages = this.getMessages();

    return matches.map(m => {
      const partnerId = m.users.find(id => id !== userId);
      const partnerProfile = allProfiles.find(p => p.userId === partnerId) || { displayName: 'Student', userId: partnerId };
      const college = colleges.find(c => c.id === partnerProfile.collegeId);

      const conversationMsgs = allMessages.filter(msg => msg.matchId === m.id);
      conversationMsgs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const latestMessage = conversationMsgs[0] || null;
      const unreadCount = conversationMsgs.filter(msg => msg.receiverId === userId && !msg.read).length;

      return {
        ...m,
        partner: {
          ...partnerProfile,
          college: college || { name: 'Roorkee College' }
        },
        latestMessage,
        unreadCount
      };
    }).sort((a, b) => {
      const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.createdAt);
      const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.createdAt);
      return timeB - timeA;
    });
  }

  unmatch(matchId) {
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === matchId);
    if (idx >= 0) {
      matches[idx].active = false;
      writeFile('matches.json', matches);
      return true;
    }
    return false;
  }

  // --- Messages & Reactions ---
  getMessages() {
    return readFile('messages.json');
  }

  getMessagesForMatch(matchId, currentUserId) {
    const messages = this.getMessages().filter(m => m.matchId === matchId);
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    this.markMessagesAsRead(matchId, currentUserId);
    return messages;
  }

  addMessage(matchId, senderId, receiverId, content) {
    const messages = this.getMessages();
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      matchId,
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
      reactions: {}
    };
    messages.push(newMsg);
    writeFile('messages.json', messages);

    // Create Notification for the receiver
    const senderProfile = this.findProfileByUserId(senderId);
    this.createNotification({
      userId: receiverId,
      type: 'message',
      title: `New message from ${senderProfile?.displayName || 'your match'}`,
      message: content.length > 50 ? `${content.substring(0, 50)}...` : content,
      link: `/messages/${matchId}`,
      data: { matchId, messageId: newMsg.id }
    });

    return newMsg;
  }

  addReactionToMessage(messageId, userId, emoji) {
    const messages = this.getMessages();
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return null;

    // IDOR Protection: only sender or receiver of the message can react to it
    if (msg.senderId !== userId && msg.receiverId !== userId) {
      return { unauthorized: true };
    }

    if (!msg.reactions) msg.reactions = {};

    // Toggle reaction if clicked same emoji, or set new emoji
    if (msg.reactions[userId] === emoji) {
      delete msg.reactions[userId];
    } else {
      msg.reactions[userId] = emoji;
    }

    writeFile('messages.json', messages);
    return msg;
  }

  deleteMessage(messageId, userId) {
    let messages = this.getMessages();
    const msg = messages.find(m => m.id === messageId);
    if (!msg || msg.senderId !== userId) return null;

    messages = messages.filter(m => m.id !== messageId);
    writeFile('messages.json', messages);
    return { success: true, messageId };
  }

  searchMessages(matchId, query) {
    if (!query) return [];
    const normalized = query.toLowerCase();
    const messages = this.getMessages().filter(m => m.matchId === matchId && m.content.toLowerCase().includes(normalized));
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return messages;
  }

  markMessagesAsRead(matchId, readerId) {
    const messages = this.getMessages();
    let updated = false;
    messages.forEach(m => {
      if (m.matchId === matchId && m.receiverId === readerId && !m.read) {
        m.read = true;
        updated = true;
      }
    });
    if (updated) {
      writeFile('messages.json', messages);
    }
  }

  // --- Notifications (PRD Section 5.8) ---
  getNotifications(userId) {
    const list = readFile('notifications.json').filter(n => n.userId === userId);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }

  getUnreadNotificationCount(userId) {
    const list = this.getNotifications(userId);
    return list.filter(n => !n.read).length;
  }

  createNotification({ userId, type, title, message, link, data }) {
    const list = readFile('notifications.json');
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: type || 'system',
      title,
      message,
      link: link || '/notifications',
      data: data || {},
      read: false,
      createdAt: new Date().toISOString()
    };
    list.push(newNotif);
    writeFile('notifications.json', list);
    return newNotif;
  }

  markNotificationRead(notificationId, userId) {
    const list = readFile('notifications.json');
    const notif = list.find(n => n.id === notificationId && n.userId === userId);
    if (!notif) return null;
    notif.read = true;
    writeFile('notifications.json', list);
    return notif;
  }

  markAllNotificationsRead(userId) {
    const list = readFile('notifications.json');
    let count = 0;
    list.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    });
    if (count > 0) {
      writeFile('notifications.json', list);
    }
    return { success: true, markedCount: count };
  }

  // --- Verification ---
  getVerifications() {
    return readFile('verifications.json');
  }

  getVerificationForUser(userId) {
    return this.getVerifications().find(v => v.userId === userId);
  }

  submitVerification(userId, collegeId, rollNumber) {
    const list = this.getVerifications();
    const existingIdx = list.findIndex(v => v.userId === userId);
    const req = {
      id: `req_${Date.now()}`,
      userId,
      collegeId,
      studentRollNumber: rollNumber,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      reviewedBy: null,
      reviewedAt: null,
      adminNotes: null
    };

    if (existingIdx >= 0) {
      list[existingIdx] = req;
    } else {
      list.push(req);
    }
    writeFile('verifications.json', list);

    this.upsertProfile(userId, { verificationStatus: 'pending' });
    return req;
  }

  updateVerificationStatus(reqId, status, notes, adminId) {
    const list = this.getVerifications();
    const item = list.find(v => v.id === reqId);
    if (!item) return null;

    item.status = status;
    item.adminNotes = notes;
    item.reviewedBy = adminId;
    item.reviewedAt = new Date().toISOString();
    writeFile('verifications.json', list);

    const mappedProfileStatus = status === 'approved' ? 'verified' : 'rejected';
    this.upsertProfile(item.userId, { verificationStatus: mappedProfileStatus });

    // Notify student about verification status
    this.createNotification({
      userId: item.userId,
      type: 'verification',
      title: status === 'approved' ? 'Student Verification Approved! 🎓' : 'Verification Update',
      message: status === 'approved'
        ? 'Your student profile now has the official verified campus badge.'
        : `Your verification request was not approved: ${notes || 'Please resubmit details.'}`,
      link: '/verification',
      data: { status }
    });

    // Log admin audit action
    this.logAdminAction(adminId, `verification_${status}`, 'verification_request', reqId, notes);

    return item;
  }

  // --- Safety & Moderation (Reports & Blocks) ---
  getReports() {
    return readFile('reports.json');
  }

  submitReport(reportedByUserId, reportedUserId, reason, description) {
    const reports = this.getReports();
    const newReport = {
      id: `rep_${Date.now()}`,
      reportedByUserId,
      reportedUserId,
      reason,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      adminNotes: null
    };
    reports.push(newReport);
    writeFile('reports.json', reports);
    return newReport;
  }

  updateReportStatus(reportId, status, adminNotes, adminId) {
    const reports = this.getReports();
    const rep = reports.find(r => r.id === reportId);
    if (!rep) return null;
    rep.status = status;
    if (adminNotes) rep.adminNotes = adminNotes;
    rep.updatedAt = new Date().toISOString();
    writeFile('reports.json', reports);

    if (adminId) {
      this.logAdminAction(adminId, `report_${status}`, 'report', reportId, adminNotes);
    }
    return rep;
  }

  getBlocks() {
    return readFile('blocks.json');
  }

  getBlockedUserIds(userId) {
    const blocks = this.getBlocks();
    const ids = [];
    blocks.forEach(b => {
      if (b.userId === userId) ids.push(b.blockedUserId);
      if (b.blockedUserId === userId) ids.push(b.userId);
    });
    return ids;
  }

  blockUser(userId, targetUserId) {
    const blocks = this.getBlocks();
    if (!blocks.some(b => b.userId === userId && b.blockedUserId === targetUserId)) {
      blocks.push({
        userId,
        blockedUserId: targetUserId,
        createdAt: new Date().toISOString()
      });
      writeFile('blocks.json', blocks);
    }
    const match = this.findMatchBetween(userId, targetUserId);
    if (match) {
      this.unmatch(match.id);
    }
    return true;
  }

  unblockUser(userId, targetUserId) {
    let blocks = this.getBlocks();
    blocks = blocks.filter(b => !(b.userId === userId && b.blockedUserId === targetUserId));
    writeFile('blocks.json', blocks);
    return true;
  }

  // --- Admin Audit Logging (PRD Table 11: admin_actions) ---
  logAdminAction(adminId, actionType, targetType, targetId, details) {
    const actions = readFile('admin_actions.json');
    const newAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      adminId,
      actionType,
      targetType,
      targetId,
      details: details || '',
      createdAt: new Date().toISOString()
    };
    actions.push(newAction);
    writeFile('admin_actions.json', actions);
    return newAction;
  }

  getAdminActions(limit = 50) {
    const actions = readFile('admin_actions.json');
    actions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return actions.slice(0, limit);
  }

  // --- Admin Analytics & Stats ---
  getAdminStats() {
    const users = this.getUsers().filter(u => u.role === 'student');
    const profiles = this.getProfiles();
    const colleges = this.getColleges();
    const matches = this.getMatches().filter(m => m.active);
    const messages = this.getMessages();
    const verifications = this.getVerifications();
    const reports = this.getReports();

    const collegeCounts = {};
    colleges.forEach(c => { collegeCounts[c.name] = 0; });
    profiles.forEach(p => {
      const c = colleges.find(col => col.id === p.collegeId);
      if (c) {
        collegeCounts[c.name] = (collegeCounts[c.name] || 0) + 1;
      }
    });

    const prefCounts = { friendship: 0, dating: 0, both: 0 };
    profiles.forEach(p => {
      if (p.connectionPreference) {
        prefCounts[p.connectionPreference] = (prefCounts[p.connectionPreference] || 0) + 1;
      }
    });

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalMatches: matches.length,
      totalMessages: messages.length,
      pendingVerifications: verifications.filter(v => v.status === 'pending').length,
      verifiedProfiles: profiles.filter(p => p.verificationStatus === 'verified').length,
      openReports: reports.filter(r => r.status === 'pending' || r.status === 'under_review').length,
      collegeDistribution: collegeCounts,
      preferenceDistribution: prefCounts
    };
  }
}

export const db = new Database();
