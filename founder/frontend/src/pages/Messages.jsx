import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DEMO_USERS } from '../data/demoData';
import { useAuth } from '../context/AuthContext';
import { useDemoProfile } from '../context/DemoProfileContext';

export function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const withUserId = searchParams.get('with');
  const fromFeed = searchParams.get('from') === 'feed';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [sentMessages, setSentMessages] = useState({});
  const { user } = useAuth();
  const { savedProfile } = useDemoProfile();

  const activeUser = withUserId ? DEMO_USERS.find((u) => u.userId === withUserId) : null;
  const displayProfile = savedProfile || { name: user?.name || 'You', bio: '', university: '', skills: [] };

  useEffect(() => {
    if (withUserId && activeUser) {
      const sent = sentMessages[withUserId] || [];
      setMessages([...sent]);
    } else {
      setMessages([]);
    }
  }, [withUserId, activeUser, sentMessages]);

  const hasPushedFor = useRef(new Set());
  useEffect(() => {
    if (fromFeed && withUserId && displayProfile?.name && !hasPushedFor.current.has(withUserId)) {
      hasPushedFor.current.add(withUserId);
      const newMsg = {
        id: Date.now().toString(),
        from: 'me',
        type: 'profile',
        profile: displayProfile,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSentMessages((prev) => ({
        ...prev,
        [withUserId]: [...(prev[withUserId] || []), newMsg],
      }));
    }
  }, [fromFeed, withUserId, displayProfile]);

  useEffect(() => {
    const convos = Object.keys(sentMessages).map((uid) => {
      const u = DEMO_USERS.find((x) => x.userId === uid) || { name: 'Unknown' };
      const sent = sentMessages[uid] || [];
      const last = sent[sent.length - 1];
      return { userId: uid, user: u, lastMessage: last?.type === 'profile' ? 'Profile shared' : last?.text, lastTime: last?.time };
    });
    setConversations(convos);
  }, [sentMessages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !withUserId) return;
    const newMsg = {
      id: Date.now().toString(),
      from: 'me',
      type: 'text',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSentMessages((prev) => ({
      ...prev,
      [withUserId]: [...(prev[withUserId] || []), newMsg],
    }));
    setInput('');
  };

  const handlePushProfile = () => {
    if (!withUserId) return;
    const newMsg = {
      id: Date.now().toString(),
      from: 'me',
      type: 'profile',
      profile: displayProfile,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSentMessages((prev) => ({
      ...prev,
      [withUserId]: [...(prev[withUserId] || []), newMsg],
    }));
  };

  const initials = (name) =>
    (name || '?')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  if (!withUserId) {
    return (
      <div className="min-h-screen pt-8 pb-12 flex flex-col max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-black mb-6 px-4">Messages</h1>
        <div className="flex-1 px-4">
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-sm">No conversations yet. Like someone to start a conversation!</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => navigate(`/messages?with=${c.userId}`)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-founder-purple/20 flex items-center justify-center text-founder-purple font-bold text-sm flex-shrink-0">
                    {initials(c.user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black truncate">{c.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500 truncate">{c.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{c.lastTime}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 flex flex-col bg-white">
      <header className="sticky top-16 left-0 right-0 z-40 h-14 bg-white/95 backdrop-blur border-b border-purple-100 flex items-center gap-4 px-4">
        <button onClick={() => navigate('/messages')} className="text-founder-purple p-1 -ml-1" aria-label="Back">
          ←
        </button>
        <button
          onClick={() => activeUser && navigate(`/profile/${activeUser.userId}`)}
          className="flex flex-1 items-center gap-3 min-w-0"
        >
          <div className="w-10 h-10 rounded-full bg-founder-purple/20 flex items-center justify-center text-founder-purple font-bold text-sm flex-shrink-0">
            {initials(activeUser?.name)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h2 className="font-semibold text-black truncate">{activeUser?.name || 'Unknown'}</h2>
            <p className="text-xs text-gray-500 truncate">{activeUser?.currentPlaceOfEmployment || activeUser?.university}</p>
          </div>
        </button>
        <span className="text-xs text-founder-purple font-medium">View profile</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24 space-y-3">
        {fromFeed && messages.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">You liked their project. Push your profile to introduce yourself!</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            {m.type === 'profile' ? (
              <div className="max-w-[85%] rounded-2xl bg-founder-purple text-white p-4 rounded-br-md shadow-lg">
                <p className="text-xs font-medium text-purple-200 mb-2">Profile shared</p>
                <p className="font-semibold">{m.profile?.name || 'You'}</p>
                {m.profile?.university && <p className="text-sm text-purple-200 mt-0.5">{m.profile.university}</p>}
                {m.profile?.bio && <p className="text-sm mt-2 opacity-90">{m.profile.bio}</p>}
                {(m.profile?.skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(m.profile.skills || []).slice(0, 5).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-white/20">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-purple-200 mt-2">{m.time}</p>
              </div>
            ) : (
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  m.from === 'me'
                    ? 'bg-founder-purple text-white rounded-br-md'
                    : 'bg-purple-50 text-black border border-purple-100 rounded-bl-md'
                }`}
              >
                <p className="text-sm">{m.text}</p>
                <p className={`text-xs mt-1 ${m.from === 'me' ? 'text-purple-200' : 'text-gray-400'}`}>{m.time}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-purple-100">
        <div className="max-w-lg mx-auto space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSend())}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-full bg-purple-50 border-2 border-purple-100 text-black placeholder:text-gray-400 focus:border-founder-purple focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="px-5 py-3 rounded-full bg-founder-purple text-white font-medium hover:bg-founder-purpleLight transition-colors"
            >
              Send
            </button>
          </div>
          <button
            onClick={handlePushProfile}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-founder-purple text-founder-purple font-medium hover:bg-founder-purple/5 transition-colors"
          >
            Push my profile
          </button>
        </div>
      </div>
    </div>
  );
}
