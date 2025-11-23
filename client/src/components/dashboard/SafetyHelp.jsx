import { useState } from 'react'
import safetyIcon from '../../assets/icons8-safety-50.png'
import carIcon from '../../assets/icons8-car-50.png'
import searchIcon from '../../assets/icons8-search-50.png'
import location from "../../assets/icons8-location-50.png"
import brain from "../../assets/icons8-brain-50.png"
import payment from "../../assets/icons8-payment-50.png"
import phone from "../../assets/icons8-phone-50.png"
import siren from "../../assets/icons8-siren-50.png"

export default function SafetyHelp() {
  const [activeTab, setActiveTab] = useState('safety')

  const safetyTips = [
    { icon: '✓', title: 'Verify Driver Info', desc: 'Always check driver ratings and reviews before booking' },
    { icon: location, title: 'Share Location', desc: 'Let trusted friends know your ride details', isImage: true },
    { icon: phone, title: 'Keep Phone Charged', desc: 'Ensure your phone has battery for emergencies', isImage: true },
    { icon: payment, title: 'Secure Payment', desc: 'Only pay through verified payment methods', isImage: true },
    { icon: brain, title: 'Trust Your Gut', desc: 'Cancel if something feels wrong', isImage: true },
    { icon: siren, title: 'Emergency Contacts', desc: 'Keep emergency numbers readily available', isImage: true },
  ]

  const emergencyServices = [
    { name: 'Police', number: '100', icon: siren},
    { name: 'Medical Emergency', number: '108', icon: siren },
    { name: 'Roadside Assistance', number: '1-800-AAA-HELP', icon: siren },
  ]

  const faqItems = [
    { q: 'What if I feel unsafe during a ride?', a: 'Press the emergency button in the app or contact our support team immediately.' },
    { q: 'How do I report a driver?', a: 'Go to your ride history and select "Report Driver" with details.' },
    { q: 'Can I ride alone?', a: 'Yes, but we recommend sharing your trip details with someone you trust.' },
    { q: 'What is your cancellation policy?', a: 'Free cancellation up to 5 minutes before pickup.' },
  ]

  return (
    <section>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
           Safety & Help
        </h1>
        <p className="text-gray-400">Your safety is our priority</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {['safety', 'emergency', 'faq'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === tab
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {tab === 'safety' && '✓ Safety Tips'}
            {tab === 'emergency' && 'Emergency'}
            {tab === 'faq' && 'FAQ'}
          </button>
        ))}
      </div>

      {/* Safety Tips */}
      {activeTab === 'safety' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {safetyTips.map((tip, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 hover:border-green-500/30 transition hover:shadow-lg hover:shadow-green-500/10">
              <div className="text-4xl mb-4">
                {tip.isImage ? <img src={tip.icon} alt={tip.title} className="w-10 h-10 object-contain" /> : tip.icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{tip.title}</h4>
              <p className="text-gray-400 text-sm">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Services */}
      {activeTab === 'emergency' && (
        <div className="max-w-2xl">
          <div className="bg-red-500/10 backdrop-blur-lg p-8 rounded-2xl border border-red-500/30 mb-8">
            <h3 className="text-2xl font-bold text-red-400 mb-6">In Case of Emergency</h3>
            <div className="space-y-4">
              {emergencyServices.map((service, i) => (
                  <div key={i} className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={service.icon} alt={service.name} className="w-8 h-8 object-contain" />
                    <div>
                      <p className="text-white font-semibold">{service.name}</p>
                      <p className="text-gray-400 text-sm">{service.number}</p>
                    </div>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                    Call
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-lg p-8 rounded-2xl border border-blue-500/30">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Safety Checklist</h3>
            <ul className="space-y-3">
              {[
                'Share ride details with a trusted contact',
                'Keep your phone visible and charged',
                'Verify driver photo and vehicle info',
                'Sit in back seat for rides',
                'Have an exit plan',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-400 text-lg">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="max-w-3xl space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-blue-400">Q:</span> {item.q}
              </h4>
              <p className="text-gray-300 flex items-start gap-2">
                <span className="text-green-400 font-bold">A:</span> {item.a}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
