import { memo } from 'react'
import { TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react'
import VoteButton from './VoteButton'

function PersonCard({ person, rank, onVoteSuccess }) {
  const change = person.change_from_start || 0
  
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-white/30" />
  }

  const getRankBadge = () => {
    if (rank === 1) return (
      <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500 rounded-lg">
        <Crown className="w-4 h-4 text-black" />
        <span className="text-sm font-black text-black">#1</span>
      </div>
    )
    if (rank === 2) return (
      <div className="px-3 py-1.5 bg-gray-400 rounded-lg">
        <span className="text-sm font-black text-black">#2</span>
      </div>
    )
    if (rank === 3) return (
      <div className="px-3 py-1.5 bg-orange-500 rounded-lg">
        <span className="text-sm font-black text-black">#3</span>
      </div>
    )
    return (
      <div className="px-3 py-1.5 bg-white/10 rounded-lg">
        <span className="text-sm font-bold text-white/70">#{rank}</span>
      </div>
    )
  }

  const getCardStyle = () => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30'
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/30'
    if (rank === 3) return 'bg-orange-500/10 border-orange-500/30'
    return 'glass-dark'
  }

  return (
    <div className={`p-4 rounded-2xl border ${getCardStyle()}`}>
      {/* Mobile Layout */}
      <div className="sm:hidden">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getRankBadge()}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate text-base">{person.name}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{person.score}</div>
            <div className="flex items-center gap-1 text-xs justify-end">
              {getTrendIcon()}
              <span className="text-white/60 font-semibold">{change > 0 ? '+' : ''}{change}</span>
            </div>
          </div>
        </div>
        <VoteButton 
          targetId={person.id} 
          targetName={person.name}
          onVoteSuccess={onVoteSuccess}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {getRankBadge()}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">{person.name}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-black text-white">{person.score}</div>
            <div className="flex items-center justify-end gap-1 text-sm">
              {getTrendIcon()}
              <span className="text-white/60 font-semibold">{change > 0 ? '+' : ''}{change}</span>
            </div>
          </div>
          <VoteButton 
            targetId={person.id} 
            targetName={person.name}
            onVoteSuccess={onVoteSuccess}
          />
        </div>
      </div>
    </div>
  )
}

export default memo(PersonCard)
