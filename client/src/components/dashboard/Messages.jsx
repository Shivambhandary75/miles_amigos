import { useState } from 'react'
import messagesIcon from '../../assets/icons8-messages-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'
import ConfirmationDialog from '../ConfirmationDialog'

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState('John')
  const [chatType, setChatType] = useState('personal') // 'personal' or 'community'
  const [messageInput, setMessageInput] = useState('')
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

  const personalChats = ['John', 'Sarah', 'Mike', 'Alex']
  const communityChatList = [
    { id: 1, name: 'City B Carpoolers',  },
    { id: 2, name: 'Weekend Riders',  },
    { id: 3, name: 'Eco Warriors',  },
    { id: 4, name: 'Office Commute',  },
  ]

  const messages = [
    { sender: 'John', text: 'Hi! Are you available for a ride to the airport tomorrow?', time: '2 min ago', avatar: profileIcon },
    { sender: 'You', text: 'Yes, what time do you need?', time: '1 min ago', avatar: profileIcon },
    { sender: 'Sarah', text: 'Thanks for the safe ride!', time: '1 hour ago', avatar: profileIcon },
  ]

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('')
      // In a real app, this would add to the messages list
    }
  }

  const handleBlockUser = () => {
    setShowBlockDialog(false)
    alert(`${selectedChat} has been blocked`)
  }

  const handleLeaveCommunity = () => {
    setShowLeaveDialog(false)
    alert(`Left ${selectedChat}`)
  }

  const isPersonalChat = chatType === 'personal'
  const chatList = isPersonalChat ? personalChats : communityChatList

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
                setSelectedChat(personalChats[0])
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                chatType === 'personal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
               Personal
            </button>
            <button
              onClick={() => {
                setChatType('community')
                setSelectedChat(communityChatList[0].name)
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                chatType === 'community'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
               Community
            </button>
          </div>

          {/* Chat List Items */}
          <div className="space-y-2">
            {isPersonalChat ? (
              personalChats.map((name, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedChat(name)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    selectedChat === name 
                      ? 'bg-blue-600 border border-blue-400' 
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <img src={profileIcon} alt={name} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{name}</p>
                    <p className="text-gray-400 text-sm truncate">Hey, are you available?</p>
                  </div>
                </div>
              ))
            ) : (
              communityChatList.map((community) => (
                <div 
                  key={community.id} 
                  onClick={() => setSelectedChat(community.name)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    selectedChat === community.name 
                      ? 'bg-blue-600 border border-blue-400' 
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">{community.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{community.name}</p>
                    <p className="text-gray-400 text-xs truncate">Group chat</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedChat}</h3>
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
          <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.sender === 'You' ? 'justify-end' : ''}`}>
                {msg.sender !== 'You' && <img src={msg.avatar} alt={msg.sender} className="w-8 h-8 rounded-full" />}
                <div className={`max-w-xs ${msg.sender === 'You' ? 'bg-green-600' : 'bg-white/10'} rounded-lg p-3`}>
                  <p className="text-white">{msg.text}</p>
                  <p className="text-gray-400 text-xs mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
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
        </div>
      </div>

      {/* Block User Dialog */}
      <ConfirmationDialog
        isOpen={showBlockDialog}
        title="Block User"
        message={`Are you sure you want to block ${selectedChat}? You won't be able to receive messages from them.`}
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
        message={`Are you sure you want to leave "${selectedChat}"? You can rejoin anytime.`}
        confirmText="Leave"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleLeaveCommunity}
        onCancel={() => setShowLeaveDialog(false)}
      />
    </section>
  )
}

