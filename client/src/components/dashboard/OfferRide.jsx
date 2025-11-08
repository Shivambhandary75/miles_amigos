import { useState } from 'react'
import ConfirmationDialog from '../ConfirmationDialog'

export default function OfferRide() {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    datetime: '',
    seats: 1,
    price: '',
    notes: '',
  })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isPosting, setIsPosting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowConfirmDialog(true)
  }

  const confirmPostRide = () => {
    setIsPosting(true)
    setTimeout(() => {
      setIsPosting(false)
      setShowConfirmDialog(false)
      console.log('Ride posted:', formData)
      // Reset form
      setFormData({
        from: '',
        to: '',
        datetime: '',
        seats: 1,
        price: '',
        notes: '',
      })
      alert('Ride posted successfully!')
    }, 1000)
  }

  return (
    <section>
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Confirm Post Ride"
        message={`Are you sure you want to post this ride from ${formData.from} to ${formData.to}? Passengers will be able to see and book this ride.`}
        confirmText="Post Ride"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={isPosting}
        onConfirm={confirmPostRide}
        onCancel={() => setShowConfirmDialog(false)}
      />
      
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2"> Offer a Ride</h1>
        <p className="text-gray-400">Share your ride and earn money</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 max-w-2xl">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-3">From Location</label>
              <input 
                type="text"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="Enter pickup location" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3">To Location</label>
              <input 
                type="text"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
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
                name="datetime"
                value={formData.datetime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-3">Available Seats</label>
              <input 
                type="number"
                name="seats"
                min="1" 
                max="7"
                value={formData.seats}
                onChange={handleInputChange}
                placeholder="1-7 seats" 
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">Price per Seat (₹)</label>
            <input 
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price" 
              className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-3">Notes</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add notes (music, pet-friendly, etc.)" 
              rows="4"
              className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition" 
            />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-lg font-bold text-lg transition-all hover:shadow-xl hover:shadow-green-500/50">
             Post Your Ride
          </button>
        </form>
      </div>
    </section>
  )
}
