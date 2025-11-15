import LeafletMapComponent from '../LeafletMapComponent'

export default function LiveMap() {
  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Live Map</h1>
        <p className="text-gray-400">View the map in real-time</p>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/10" style={{ height: '600px' }}>
        <LeafletMapComponent
          startLocation={[77.5946, 12.9716]}
          endLocation={[77.7099, 13.1939]}
          zoom={12}
        />
      </div>
    </section>
  )
}
