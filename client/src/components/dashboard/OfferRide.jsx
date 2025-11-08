export default function OfferRide() {
  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2"> Offer a Ride</h1>
        <p className="text-gray-400">Share your ride and earn money</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 max-w-2xl">
        <form className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-3">From Location</label>
              <input 
                type="text" 
                placeholder="Enter pickup location" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3">To Location</label>
              <input 
                type="text" 
                placeholder="Enter destination" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-3">Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3">Available Seats</label>
              <input 
                type="number" 
                min="1" 
                max="7"
                placeholder="1-7 seats" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">Price per Seat (₹)</label>
            <input 
              type="number" 
              placeholder="Enter price" 
              className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">Notes</label>
            <textarea 
              placeholder="Add notes (music, pet-friendly, etc.)" 
              rows="4"
              className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
            />
          </div>

          <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-xl hover:shadow-green-500/50">
             Post Your Ride
          </button>
        </form>
      </div>
    </section>
  )
}
