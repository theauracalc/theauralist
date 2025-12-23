// src/components/Leaderboard.jsx
import NewsBanner from './NewsBanner'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import PersonCard from './PersonCard'
import { TrendingUp, Trophy, Flame, Search } from 'lucide-react'


export default function Leaderboard() {
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPeople()
    
    const subscription = supabase
      .channel('leaderboard')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'people' 
      }, () => {
        fetchPeople()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchPeople() {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')

    if (!error && data) {
      setPeople(data)
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    let result = people

    // Search by name
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filter by rising/falling using change_from_start
    if (filter === 'rising') {
      result = result
        .filter(p => (p.change_from_start || 0) > 0)
        .sort((a, b) => (b.change_from_start || 0) - (a.change_from_start || 0))
    } else if (filter === 'falling') {
      result = result
        .filter(p => (p.change_from_start || 0) < 0)
        .sort((a, b) => (a.change_from_start || 0) - (b.change_from_start || 0))
    }

    return result
  }, [people, filter, search])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-white/80">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8 bg-black">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-dark border-b border-white/10 mb-6 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-center mb-4 text-white">
            AURA LIST
          </h1>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
            />
          </div>
          
          <p className="text-center text-white/50 text-sm">
            {filtered.length} / {people.length} members • Vote every 24h
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              filter === 'all' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50' 
                : 'glass-dark text-white/60 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            All
          </button>
          <button
            onClick={() => setFilter('rising')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              filter === 'rising' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/50' 
                : 'glass-dark text-white/60 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Rising
          </button>
          <button
            onClick={() => setFilter('falling')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
              filter === 'falling' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50' 
                : 'glass-dark text-white/60 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            Falling
          </button>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-lg">No members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((person) => (
              <PersonCard 
                key={person.id} 
                person={person} 
                rank={person.rank}
                onVoteSuccess={fetchPeople}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

