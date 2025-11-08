import { useState } from 'react'

export default function ConfirmationDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDangerous = false,
  onConfirm, 
  onCancel,
  isLoading = false 
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-700">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-300 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-medium transition-all duration-300 
                       bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2
                       ${isDangerous 
                         ? 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50' 
                         : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                       } disabled:cursor-not-allowed`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
