import messagesIcon from '../../assets/icons8-messages-50.png'
import profileIcon from '../../assets/icons8-profile-50.png'

export default function Messages() {
  const messages = [
    { sender: 'John', text: 'Hi! Are you available for a ride to the airport tomorrow?', time: '2 min ago', avatar: profileIcon },
    { sender: 'You', text: 'Yes, what time do you need?', time: '1 min ago', avatar: profileIcon },
    { sender: 'Sarah', text: 'Thanks for the safe ride!', time: '1 hour ago', avatar: profileIcon },
  ]

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
          <h3 className="text-xl font-bold text-white mb-4">Recent Chats</h3>
          <div className="space-y-2">
            {['John', 'Sarah', 'Mike', 'Alex'].map((name, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition">
                <img src={profileIcon} alt={name} className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <p className="text-white font-medium">{name}</p>
                  <p className="text-gray-400 text-sm truncate">Hey, are you available?</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">John</h3>
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
              placeholder="Type your message..." 
              className="flex-1 px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
