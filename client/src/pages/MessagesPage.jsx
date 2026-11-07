import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageApi, matchApi, safetyApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Send,
  MessageCircle,
  Shield,
  MoreVertical,
  UserX,
  Flag,
  ArrowLeft,
  Sparkles,
  MapPin,
  CheckCheck,
  Check
} from 'lucide-react';

const ICEBREAKERS = [
  "Hey! What's your favorite chai spot in Roorkee?",
  "Saw you're into indie music! Any playlist recommendations?",
  "Are you attending the upcoming college tech fest?",
  "Down for a badminton match or gym session sometime?"
];

export default function MessagesPage() {
  const { matchId } = useParams();
  const { user, profile } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [activeMatch, setActiveMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState(null);

  // Safety Modal
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate Content');
  const [reportDesc, setReportDesc] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    matchApi.getMatches()
      .then(res => {
        setMatches(res.data || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (matchId && matches.length > 0) {
      const found = matches.find(m => m.id === matchId);
      if (found) {
        setActiveMatch(found);
      }
    } else if (!matchId && matches.length > 0) {
      if (window.innerWidth >= 1024) {
        setActiveMatch(matches[0]);
      }
    }
  }, [matchId, matches]);

  useEffect(() => {
    if (!activeMatch) return;

    messageApi.getConversation(activeMatch.id)
      .then(res => {
        setMessages(res.data.messages || []);
        setPartner(res.data.partner || activeMatch.partner);
      })
      .catch(err => console.error(err));

    if (socket) {
      socket.emit('join:match', { matchId: activeMatch.id });
    }

    return () => {
      if (socket) {
        socket.emit('leave:match', { matchId: activeMatch.id });
      }
    };
  }, [activeMatch?.id, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMsg) => {
      if (activeMatch && newMsg.matchId === activeMatch.id) {
        setMessages(prev => [...prev, newMsg]);
      }
    };

    socket.on('message:received', handleMessageReceived);

    return () => {
      socket.off('message:received', handleMessageReceived);
    };
  }, [socket, activeMatch?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const content = textToSend || inputText;
    if (!content.trim() || !activeMatch) return;

    try {
      const res = await messageApi.sendMessage(activeMatch.id, content);
      setMessages(prev => [...prev, res.data]);
      setInputText('');

      if (socket) {
        socket.emit('message:send', {
          matchId: activeMatch.id,
          senderId: user.id,
          receiverId: activeMatch.users.find(id => id !== user.id),
          content
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async () => {
    if (!partner || !window.confirm(`Block ${partner.displayName}? They will be completely removed.`)) return;
    try {
      await safetyApi.blockUser(partner.userId);
      setShowSafetyModal(false);
      navigate('/matches');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async () => {
    if (!partner) return;
    try {
      await safetyApi.reportUser({
        targetUserId: partner.userId,
        reason: reportReason,
        description: reportDesc
      });
      alert('Report submitted for admin moderation review.');
      setShowSafetyModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`h-[calc(100dvh-4.5rem)] max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex flex-col text-pink-50 ${activeMatch && matchId ? 'pb-2' : 'pb-24 lg:pb-4'}`}>
      <div className="flex-1 rounded-3xl glass-panel-elevated border border-pink-500/25 overflow-hidden flex shadow-2xl">
        {/* Left Pane: Match List */}
        <div className={`w-full lg:w-80 border-r border-pink-500/15 flex flex-col ${
          activeMatch && matchId ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-pink-500/15">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-400" />
              <span>Campus Chats</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-pink-500/10">
            {matches.length === 0 ? (
              <div className="p-8 text-center text-xs text-pink-300/60">
                No active conversations yet. Match with other students in Discover to start chatting!
              </div>
            ) : (
              matches.map((m) => {
                const p = m.partner || {};
                const isSelected = activeMatch?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setActiveMatch(m);
                      navigate(`/messages/${m.id}`);
                    }}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-pink-500/20 border-l-4 border-pink-400'
                        : 'hover:bg-pink-500/10'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={p.avatarUrl}
                        alt={p.displayName}
                        className="w-12 h-12 rounded-2xl object-cover border border-pink-400/30"
                      />
                      {isUserOnline(p.userId) && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-pink-500 border-2 border-black shadow-glow-pink" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-bold text-white truncate">{p.displayName}</span>
                        <span className="text-[10px] text-pink-300/50">
                          {m.latestMessage ? new Date(m.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-pink-200/60 truncate">
                        {m.latestMessage ? m.latestMessage.content : p.college?.name || 'New campus connection!'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Room */}
        <div className={`flex-1 flex flex-col bg-[#0b050f] ${
          !activeMatch ? 'hidden lg:flex items-center justify-center' : 'flex'
        }`}>
          {activeMatch ? (
            <>
              {/* Chat Header with Safety Controls */}
              <div className="h-16 px-4 border-b border-pink-500/15 flex items-center justify-between glass-panel">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveMatch(null);
                      navigate('/messages');
                    }}
                    className="lg:hidden p-1.5 rounded-xl text-pink-300/60 hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={partner?.avatarUrl || activeMatch.partner?.avatarUrl}
                    alt="Partner"
                    className="w-10 h-10 rounded-2xl object-cover border border-pink-400/50 shadow-glow-pink"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{partner?.displayName || activeMatch.partner?.displayName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-200 border border-pink-400/30">
                        {partner?.college?.name || activeMatch.partner?.college?.name || 'Roorkee Campus'}
                      </span>
                    </h3>
                    <span className="text-[11px] text-pink-400 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                      Active Student
                    </span>
                  </div>
                </div>

                {/* Safety & Moderation Trigger */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSafetyModal(true)}
                    className="p-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-rose-300 transition-all flex items-center gap-1.5 text-xs font-semibold border border-rose-500/25"
                    title="Safety & Moderation Options"
                  >
                    <Shield className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">Safety</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/15 text-center text-xs text-pink-200/70 max-w-md mx-auto">
                  🔒 This conversation is private between verified demo profiles. Keep conversations respectful and aligned with college safety guidelines.
                </div>

                {messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-sm sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white font-medium rounded-br-none shadow-glow-pink'
                            : 'glass-panel text-pink-100 rounded-bl-none border border-pink-500/20'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-pink-300/50 mt-1 px-1">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          msg.read
                            ? <CheckCheck className="w-3 h-3 text-pink-400" />
                            : <Check className="w-3 h-3 text-pink-300/40" />
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Icebreaker Suggestions in Pink */}
              {messages.length < 3 && (
                <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto border-t border-pink-500/15 bg-pink-500/5">
                  <span className="text-[11px] text-pink-300 font-bold flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3 text-pink-400" /> Icebreakers:
                  </span>
                  {ICEBREAKERS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-xs px-3 py-1 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-100 whitespace-nowrap border border-pink-400/25 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-pink-500/15 glass-panel">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${partner?.displayName || 'student'}...`}
                    className="flex-1 px-4 py-3 rounded-2xl glass-input text-base sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 disabled:opacity-40 transition-all shadow-glow-pink"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center p-8 text-pink-300/40">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Select a mutual match to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Safety & Moderation Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel-elevated border border-pink-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400" />
              <span>Safety & Moderation Options</span>
            </h3>
            <p className="text-xs text-pink-200/70 mb-4">
              Take action if this profile violates college community standards or sends inappropriate messages.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs bg-[#150a1b]"
                >
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Harassment or Abuse">Harassment or Abuse</option>
                  <option value="Fake Profile">Fake Profile / Impersonation</option>
                  <option value="Spam / Commercial">Spam or Commercial Promotion</option>
                  <option value="Other">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-pink-200 mb-1">Additional Details (Optional)</label>
                <textarea
                  rows={2}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-xs"
                  placeholder="Explain what happened..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleReport}
                className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-200 font-bold text-xs hover:bg-amber-500/30 border border-amber-500/40"
              >
                Submit Report to Admin Queue
              </button>
              <button
                onClick={handleBlock}
                className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-200 font-bold text-xs hover:bg-rose-500/30 border border-rose-500/40"
              >
                Block & Remove Match
              </button>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="w-full py-2 rounded-xl bg-pink-500/10 text-pink-300 text-xs font-semibold hover:bg-pink-500/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
