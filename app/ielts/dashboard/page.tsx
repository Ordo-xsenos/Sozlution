'use client'

import React from 'react'
import { useApp } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Target, 
  BookOpen, 
  PenTool, 
  FileText, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

export default function IeltsDashboard() {
  const { user } = useApp()

  const stats = [
    { label: 'Overall Estimated Band', value: '6.5', icon: Trophy, color: 'text-amber-500' },
    { label: 'Target Band', value: '7.5', icon: Target, color: 'text-blue-500' },
    { label: 'Days Remaining', value: '45', icon: Sparkles, color: 'text-emerald-500' },
  ]

  const modules = [
    {
      title: 'Academic Vocabulary',
      desc: 'Master 1000+ high-frequency academic words for IELTS.',
      icon: BookOpen,
      href: '/ielts/vocabulary',
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    },
    {
      title: 'Writing Practice',
      desc: 'AI-powered feedback on Task 1 and Task 2 essays.',
      icon: PenTool,
      href: '/ielts/writing',
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
    },
    {
      title: 'Mock Tests',
      desc: 'Full-length Reading and Listening simulations.',
      icon: FileText,
      href: '/ielts/mock-tests',
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
    }
  ]

  return (
    <div className="p-4 md:p-10 space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Hello, <span className="text-amber-500">{user?.name || 'Candidate'}</span>
          </h1>
          <p className="text-gray-500 text-lg">Welcome to your professional IELTS preparation dashboard.</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 rounded-xl">
            Start Daily Plan
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="bg-[#111827] border-white/5 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-white">{s.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modules Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Training Modules <ArrowUpRight className="w-5 h-5 text-amber-500" />
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <Link key={i} href={m.href} className="group">
              <Card className={`h-full p-8 rounded-[32px] border-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${m.color}`}>
                <m.icon className="w-10 h-10 mb-6" />
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-amber-400 transition-colors">{m.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{m.desc}</p>
                <div className="mt-8 flex items-center text-xs font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Module <ArrowUpRight className="ml-1 w-3 h-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="bg-[#0b1121] border-amber-500/10 p-10 rounded-[40px] text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">Your Path to Band 7.5+</h3>
          <p className="text-gray-500">
            Complete your daily vocabulary set and submit one writing task to stay on track with your study plan.
          </p>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl">
            View Detailed Analytics
          </Button>
        </div>
      </Card>
    </div>
  )
}
