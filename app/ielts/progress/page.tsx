'use client'

import React from 'react'
import { useApp } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, TrendingUp, Calendar, Zap } from 'lucide-react'

export default function IeltsProgress() {
  const { user, ieltsStats, loading } = useApp()

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050810]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
      </div>
    )
  }

  const stats = [
    { 
      label: 'Writing Tasks Done', 
      value: ieltsStats?.writing_tasks_completed.toString() || '0', 
      target: '20', 
      icon: Zap, 
      color: 'text-amber-500' 
    },
    { 
      label: 'Overall Estimated Band', 
      value: ieltsStats?.estimated_band.toFixed(1) || '0.0', 
      target: ieltsStats?.target_band.toFixed(1) || '7.5', 
      icon: Target, 
      color: 'text-blue-500' 
    },
    { 
      label: 'Words Mastered', 
      value: ieltsStats?.vocabulary_mastered.toString() || '0', 
      target: '1000', 
      icon: Trophy, 
      color: 'text-emerald-500' 
    },
  ]

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-amber-500 flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          IELTS Progress
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="bg-[#0a0f1d] border-white/5 p-8 rounded-[32px] space-y-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-white">{s.value}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                <span>Progress</span>
                <span>Goal: {s.target}</span>
              </div>
              <Progress value={45} className="h-1.5 bg-black" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-[#0a0f1d] border-white/5 p-10 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6">
         <Calendar className="w-16 h-16 text-amber-500/20" />
         <h3 className="text-2xl font-bold">Activity Heatmap</h3>
         <p className="text-gray-500 max-w-md italic">
           Historical data will appear here once you complete more daily academic tasks.
         </p>
         <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const today = new Date()
              const d = new Date()
              d.setDate(today.getDate() - (27 - i))
              const key = d.toISOString().split('T')[0]
              const count = ieltsStats?.activity_heatmap?.[key] || 0
              
              return (
                <div 
                  key={i} 
                  title={`${key}: ${count} actions`}
                  className={`w-4 h-4 rounded-sm transition-colors ${
                    count > 0 ? 'bg-amber-500' : 'bg-white/5'
                  }`} 
                  style={{ opacity: count > 0 ? Math.min(1, 0.3 + count * 0.2) : 1 }}
                />
              )
            })}
         </div>
      </Card>
    </div>
  )
}
