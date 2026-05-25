/**
 * Animated "..." indicator shown while waiting for the bot response.
 */
export default function LoadingDots() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
        🦜
      </div>
      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
      </div>
    </div>
  )
}
