import { useState, useEffect, memo, useCallback } from 'react'
import { ArrowUp, ArrowDown, Clock, Zap } from 'lucide-react'
import { supabase, getAnonymousUserId } from '../lib/supabase'

function VoteButton({ targetId, targetName, onVoteSuccess }) {
  const [cooldown, setCooldown] = useState(null)
  const [voting, setVoting] = useState(false)
  const [lastVotePoints, setLastVotePoints] = useState(null)

  useEffect(() => {
    checkCooldown()
  }, [targetId])

  const checkCooldown = useCallback(async () => {
    try {
      const voterId = await Promise.race([
        getAnonymousUserId(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ])
      
      const { data } = await Promise.race([
        supabase
          .from('votes')
          .select('created_at')
          .eq('voter_id', voterId)
          .eq('target_id', targetId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ])

      if (data) {
        const lastVote = new Date(data.created_at)
        const nextVote = new Date(lastVote.getTime() + 24 * 60 * 60 * 1000)
        const now = new Date()
        
        if (now < nextVote) {
          setCooldown(nextVote)
        }
      }
    } catch (error) {
      console.log('Cooldown check skipped:', error.message)
    }
  }, [targetId])

  const handleVote = useCallback(async (value) => {
    if (cooldown || voting) return
    
    setVoting(true)
    try {
      const voterId = await getAnonymousUserId()
      
      const { data, error } = await supabase
        .rpc('cast_vote', {
          p_voter_id: voterId,
          p_target_id: targetId,
          p_vote_value: value
        })

      if (error) throw error

      if (data?.success) {
        setCooldown(new Date(Date.now() + 24 * 60 * 60 * 1000))
        setLastVotePoints(data.points)
        
        // Show feedback then hide after 2 seconds
        setTimeout(() => setLastVotePoints(null), 2000)
        
        onVoteSuccess?.()
      } else {
        alert(data?.error || 'Vote failed')
      }
    } catch (error) {
      console.error('Vote error:', error)
      alert('Vote failed')
    } finally {
      setVoting(false)
    }
  }, [cooldown, voting, targetId, onVoteSuccess])

  const getCooldownText = () => {
    if (!cooldown) return null
    const now = new Date()
    const diff = cooldown - now
    if (diff <= 0) {
      setCooldown(null)
      return null
    }
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const cooldownText = getCooldownText()

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      {lastVotePoints && (
        <div className="text-center text-sm font-bold text-yellow-400 animate-pulse">
          <Zap className="w-4 h-4 inline" /> ±{lastVotePoints} points!
        </div>
      )}
      
      <div className="flex gap-3 w-full sm:w-auto">
        {cooldownText ? (
          <div className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-base font-black text-white w-full">
            <Clock className="w-5 h-5" />
            <span>{cooldownText}</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => handleVote(1)}
              disabled={voting}
              style={{ backgroundColor: '#00ff00', color: '#000000' }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-lg transition-all disabled:opacity-50 active:scale-95 hover:brightness-110"
            >
              <ArrowUp className="w-6 h-6 stroke-[4]" style={{ color: '#000000' }} />
              <span>UP</span>
            </button>
            <button
              onClick={() => handleVote(-1)}
              disabled={voting}
              style={{ backgroundColor: '#ff0000', color: '#ffffff' }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-lg transition-all disabled:opacity-50 active:scale-95 hover:brightness-110"
            >
              <ArrowDown className="w-6 h-6 stroke-[4]" style={{ color: '#ffffff' }} />
              <span>DOWN</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default memo(VoteButton)
