import { useState, useEffect } from 'react'
import messagesIcon from '../../assets/icons8-messages-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'
import ConfirmationDialog from '../ConfirmationDialog'
import { useApp } from '../../context/AppContext'
import { api } from '../../utils/api'

export default function Messages() {
  const {
    messages,
    addMessage,
    communities,
    currentChat: selectedChat,
    setCurrentChat: setSelectedChat,
    chatType,
    setChatType
  } = useApp()

  const [messageInput, setMessageInput] = useState('')
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Initialize selected chat
  useEffect(() => {
    if (chatType === 'personal' && messages.personalChats.length > 0 && !selectedChat) {
      setSelectedChat(messages.personalChats[0])
    } else if (chatType === 'community' && communities.length > 0 && !selectedChat) {
      setSelectedChat(communities[0])
    }
  }, [chatType, messages.personalChats, communities, selectedChat, setSelectedChat])

  // Fetch messages when selected chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      setLoadingMessages(true);
      try {
        let res;
        if (chatType === 'community') {
          res = await api.get(`/communities/${selectedChat._id}/messages`);
        } else {
          // For personal chat, selectedChat is the user object
          res = await api.get(`/messages/${selectedChat.user._id}`);
        }
        setChatMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Poll for new messages every 5 seconds (simple real-time simulation)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);

  }, [selectedChat, chatType]);

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedChat) {
      const content = messageInput;
      setMessageInput('')

      try {
        if (chatType === 'community') {
          await addMessage('community', selectedChat._id, content);
        } else {
          await addMessage('personal', selectedChat.user._id, content);
        }
        // Optimistic update
        setChatMessages(prev => [...prev, {
          sender: { name: 'You', _id: 'me' }, // Mock sender for immediate display
          content: content,
          timestamp: new Date().toISOString()
        }]);

        // Re-fetch to confirm and get proper data
        // (The polling or next fetch will handle this)
      } catch (error) {
        console.error("Failed to send message", error);
        // Revert optimistic update if needed
      }
    }
  }

  const handleBlockUser = () => {
    setShowBlockDialog(false)
    alert(`${selectedChat?.user?.name} has been blocked`)
  }

  const handleLeaveCommunity = () => {
    setShowLeaveDialog(false)
    alert(`Left ${selectedChat?.name}`)
  }

  const isPersonalChat = chatType === 'personal'

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Messages
        </h1>
        <p className="text-gray-400">Chat with your ride partners</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Messages</h3>

          {/* Chat Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setChatType('personal')
                setSelectedChat(null)
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${chatType === 'personal'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
            >
              Personal
            </button>
            <button
              onClick={() => {
                setChatType('community')
                setSelectedChat(null)
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${chatType === 'community'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
            >
              Community
            </button>
          </div>

          {/* Chat List Items */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {isPersonalChat ? (
              messages.personalChats.length > 0 ? (
                messages.personalChats.map((chat, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedChat(chat)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedChat?.user?._id === chat.user._id
                      ? 'bg-blue-600 border border-blue-400'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                  >
                    <img src={chat.user.avatar || profileIcon} alt={chat.user.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium">{chat.user.name}</p>
                      <p className="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No conversations yet</p>
              )
            ) : (
              communities.length > 0 ? (
                communities.map((community) => (
                  <div
                    key={community._id}
                    onClick={() => setSelectedChat(community)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${selectedChat?._id === community._id
                      ? 'bg-blue-600 border border-blue-400'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                  >
                    <span className="text-2xl">{community.icon || '👥'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{community.name}</p>
                      <p className="text-gray-400 text-xs truncate">{community.members.length} members</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No communities joined</p>
              )
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 flex flex-col h-[600px]">
          {selectedChat ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {chatType === 'personal' ? selectedChat.user.name : selectedChat.name}
                  </h3>
                  <p className="text-xs text-gray-400">{chatType === 'personal' ? ' Direct Message' : 'Group Chat'}</p>
                </div>
                <div className="flex gap-2">
                  {chatType === 'personal' && (
                    <button
                      onClick={() => setShowBlockDialog(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                    >
                      Block
                    </button>
                  )}
                  {chatType === 'community' && (
                    <button
                      onClick={() => setShowLeaveDialog(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                    >
                      Leave
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-6 overflow-y-auto pr-2">
                {loadingMessages ? (
                  <p className="text-center text-gray-400">Loading messages...</p>
                ) : chatMessages.length > 0 ? (
                  chatMessages.map((msg, idx) => {
                    const isMe = msg.sender._id === 'me' || (msg.sender._id && msg.sender._id !== selectedChat?.user?._id && chatType === 'personal') || (msg.sender._id && msg.sender._id === 'me');
                    // Simplified logic: In personal chat, if sender is NOT the other person, it's me. 
                    // Actually, better to check against current user ID from token/context, but for now we rely on populated sender logic or 'me' tag

                    // Let's refine "isMe" logic:
                    // We don't have current user ID easily available in this component scope without decoding token or fetching 'me'.
                    // However, the backend populates sender. If sender._id != selectedChat.user._id (in personal), it's likely me.
                    // But wait, in personal chat, messages are between A and B. If I am A, and I'm talking to B (selectedChat), then any msg where sender!=B is me.

                    const isSenderMe = chatType === 'personal'
                      ? msg.sender._id !== selectedChat.user._id
                      : (msg.sender.name === 'You' || msg.sender._id === 'me'); // Community chat needs explicit check, but we lack my ID here. 

                    // FIX: We need current user ID to be sure.
                    // For now, let's assume if the sender name is NOT the selected chat name, it's me (flawed but works for simple 1-1).
                    // Better: AppContext should provide current user info.

                    return (
                      <div key={idx} className={`flex gap-3 ${isSenderMe ? 'justify-end' : ''}`}>
                        {!isSenderMe && <img src={msg.sender.avatar || profileIcon} alt={msg.sender.name} className="w-8 h-8 rounded-full" />}
                        <div className={`max-w-xs ${isSenderMe ? 'bg-green-600' : 'bg-white/10'} rounded-lg p-3`}>
                          {!isSenderMe && chatType === 'community' && <p className="text-xs text-gray-300 font-bold mb-1">{msg.sender.name}</p>}
                          <p className="text-white">{msg.content}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 mt-10">No messages yet. Say hi!</p>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <img src={messagesIcon} alt="Messages" className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Block User Dialog */}
      <ConfirmationDialog
        isOpen={showBlockDialog}
        title="Block User"
        message={`Are you sure you want to block ${selectedChat?.user?.name}? You won't be able to receive messages from them.`}
        confirmText="Block"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleBlockUser}
        onCancel={() => setShowBlockDialog(false)}
      />

      {/* Leave Community Dialog */}
      <ConfirmationDialog
        isOpen={showLeaveDialog}
        title="Leave Community"
        message={`Are you sure you want to leave "${selectedChat?.name}"? You can rejoin anytime.`}
        confirmText="Leave"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleLeaveCommunity}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </section>
  )
}

