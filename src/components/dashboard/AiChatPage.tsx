'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  Lightbulb,
  BarChart2,
  Ticket,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AiChatPageProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Halo! 👋 Saya **Arul-Pani AI**, asisten cerdas platform manajemen proyek kamu.

Saya siap membantu kamu dengan berbagai hal:
• **Manajemen proyek** — strategi, prioritas, dan perencanaan
• **Analisis tim** — produktivitas dan kolaborasi
• **Pengelolaan tiket** — best practices dan workflow
• **Tips & insight** — manajemen waktu dan efisiensi

Apa yang ingin kamu tanyakan hari ini?`,
  timestamp: new Date(),
}

const QUICK_PROMPTS = [
  {
    icon: Lightbulb,
    label: 'Tips produktivitas tim',
    prompt: 'Berikan 5 tips untuk meningkatkan produktivitas tim dalam manajemen proyek.',
  },
  {
    icon: Ticket,
    label: 'Cara prioritas tiket',
    prompt: 'Bagaimana cara terbaik untuk memprioritaskan tiket dalam project management?',
  },
  {
    icon: BarChart2,
    label: 'Analisis performa proyek',
    prompt: 'Apa metrik-metrik penting yang harus diperhatikan untuk mengukur keberhasilan sebuah proyek?',
  },
  {
    icon: Users,
    label: 'Manajemen tim remote',
    prompt: 'Berikan strategi efektif untuk mengelola tim yang bekerja secara remote.',
  },
]

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:var(--muted);padding:2px 6px;border-radius:4px;font-size:0.85em">$1</code>')
    .replace(/^• (.+)/gm, '<span style="display:flex;align-items:flex-center;gap:8px;margin:4px 0"><span style="flex-shrink:0;opacity:0.5">●</span><span>$1</span></span>')
    .replace(/\n/g, '<br />')
}

export default function AiChatPage({ user }: AiChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const allMessages = [...messages, userMessage].filter((m) => m.id !== 'welcome')
      const payload = allMessages.map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.ok ? data.message : (data.error ?? 'Terjadi kesalahan.'),
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan koneksi. Pastikan internet kamu terhubung dan coba lagi.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE])
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  const showQuickPrompts = messages.length <= 1

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-56px-32px)]" suppressHydrationWarning>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center md:gap-3 gap-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-foreground">
            <Sparkles size={20} className="text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-xs text-muted-foreground">Didukung oleh Gemini AI</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            id="ai-page-clear-btn"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            <Trash2 size={13} />
            Hapus percakapan
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="flex flex-col flex-1 rounded-2xl border border-border overflow-hidden bg-card shadow-sm">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Welcome banner */}
          {showQuickPrompts && (
            <div className="rounded-2xl p-4 sm:p-6 mb-2 bg-foreground text-background">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="opacity-80" />
                <span className="font-semibold text-sm">Arul-Pani AI</span>
                <span className="text-xs opacity-50 ml-auto">Gemini Powered</span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                Halo, <strong>{user.name}</strong>! Saya siap membantu kamu mengelola proyek dengan lebih efektif. Mulai dengan memilih topik di bawah atau ketik pertanyaanmu langsung.
              </p>
            </div>
          )}

          {/* Render messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm',
                  msg.role === 'assistant' ? 'bg-foreground' : 'bg-muted border border-border',
                )}
              >
                {msg.role === 'assistant' ? (
                  <Bot size={14} className="text-background" />
                ) : (
                  <User size={14} className="text-muted-foreground" />
                )}
              </div>

              {/* Bubble */}
              <div className={cn('max-w-[75%] sm:max-w-[65%] space-y-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                    msg.role === 'user'
                      ? 'bg-foreground text-background rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                </div>
                <p className={cn('text-[10px] text-muted-foreground px-1', msg.role === 'user' ? 'text-right' : 'text-left')}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex gap-3 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm bg-foreground">
                <Bot size={14} className="text-background" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {showQuickPrompts && (
          <div className="px-4 sm:px-6 pb-3 grid grid-cols-2 gap-2 flex-shrink-0">
            {QUICK_PROMPTS.map((qp) => {
              const Icon = qp.icon
              return (
                <button
                  key={qp.label}
                  id={`quick-prompt-${qp.label.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => handleSend(qp.prompt)}
                  className="flex items-center gap-2 text-left text-xs border border-border rounded-xl px-3 py-2.5 hover:bg-muted hover:border-foreground/30 transition-all duration-150 group"
                >
                  <Icon size={14} className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                    {qp.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border p-3 sm:p-4 flex-shrink-0">
          <div className="flex gap-3 items-end bg-muted border border-border rounded-xl px-4 py-3 focus-within:border-foreground/40 transition-all">
            <textarea
              ref={inputRef}
              id="ai-page-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya Arul-Pani AI apa saja..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground leading-relaxed disabled:opacity-50"
              style={{ scrollbarWidth: 'none' }}
            />
            <button
              id="ai-page-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={cn(
                'flex-shrink-0 flex items-center justify-center transition-all duration-150',
                input.trim() && !isLoading
                  ? ' hover:opacity-80 active:scale-95'
                  : 'opacity-30 cursor-not-allowed bg-muted-foreground/20 text-muted-foreground',
              )}
            >
              <Send size={20} />
            </button>
          </div>
          <div className='flex flex-row justify-center items-center gap-1'>
            <p className="text-[10px] lg:flex hidden justify-center items-center text-muted-foreground text-center mt-2">
              Enter untuk kirim - Shift+Enter untuk baris baru -
            </p>
            <p className="text-[10px] flex justify-center items-center text-muted-foreground text-center mt-2">
              Didukung Gemini AI
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
