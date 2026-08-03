import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const SYSTEM_PROMPT = `Kamu adalah asisten AI bernama "Arul-Pani AI" untuk platform manajemen proyek Arul-Pani. 
Kamu membantu pengguna dengan:
- Pertanyaan tentang manajemen proyek
- Cara menggunakan fitur-fitur dashboard
- Tips produktivitas tim
- Penjelasan tentang tiket, tugas, dan laporan
- Pertanyaan umum seputar pekerjaan

Jawab dalam Bahasa Indonesia yang ramah, singkat, dan profesional. 
Jika pertanyaan di luar konteks, tetap bantu semampu kamu dengan sopan.`

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[Chat API] GEMINI_API_KEY is not set')
      return NextResponse.json({ error: 'API key tidak dikonfigurasi.' }, { status: 500 })
    }

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    // Build chat history (exclude last message which is the current user message)
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({ history })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = result.response.text()

    return NextResponse.json({ message: response })
  } catch (error: unknown) {
    // Log the full error details to server console for debugging
    const err = error as { message?: string; status?: number; statusText?: string }
    console.error('[Chat API] Error:', {
      message: err?.message,
      status: err?.status,
      statusText: err?.statusText,
      full: error,
    })

    // Return more descriptive error to client
    const userMessage =
      err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('API key')
        ? 'API key Gemini tidak valid. Periksa GEMINI_API_KEY di file .env.'
        : err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED')
          ? 'Kuota API Gemini habis. Coba lagi nanti.'
          : err?.message?.includes('not found') || err?.message?.includes('404')
            ? 'Model AI tidak ditemukan. Periksa konfigurasi.'
            : 'Terjadi kesalahan saat menghubungi AI. Coba lagi.'

    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
