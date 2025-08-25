import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ModerationRequest {
  content: string;
  type?: 'message' | 'product' | 'profile';
}

interface ModerationResponse {
  isAppropriate: boolean;
  originalContent: string;
  moderatedContent: string;
  flaggedPatterns: string[];
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, type = 'message' }: ModerationRequest = await req.json()

    // Content moderation patterns with Turkish and English support
    const moderationPatterns = [
      // Phone numbers (Turkish and international formats)
      {
        pattern: /(\+90\s?)?(\(0?\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{2}[-.\s]?\d{2}/gi,
        replacement: '[İletişim bilgisi güvenlik nedeniyle kaldırıldı]',
        description: 'Phone number'
      },
      {
        pattern: /(\+\d{1,3}\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi,
        replacement: '[İletişim bilgisi güvenlik nedeniyle kaldırıldı]',
        description: 'International phone number'
      },
      
      // Email addresses
      {
        pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
        replacement: '[E-posta adresi güvenlik nedeniyle kaldırıldı]',
        description: 'Email address'
      },
      
      // Social media and messaging platform URLs
      {
        pattern: /(https?:\/\/)?(www\.)?(whatsapp|wa)\.me\/[\w\d+]+/gi,
        replacement: '[WhatsApp linki güvenlik nedeniyle kaldırıldı]',
        description: 'WhatsApp link'
      },
      {
        pattern: /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/[\w\d.]+/gi,
        replacement: '[Facebook linki güvenlik nedeniyle kaldırıldı]',
        description: 'Facebook link'
      },
      {
        pattern: /(https?:\/\/)?(www\.)?t\.me\/[\w\d_]+/gi,
        replacement: '[Telegram linki güvenlik nedeniyle kaldırıldı]',
        description: 'Telegram link'
      },
      {
        pattern: /(https?:\/\/)?(www\.)?instagram\.com\/[\w\d.]+/gi,
        replacement: '[Instagram linki güvenlik nedeniyle kaldırıldı]',
        description: 'Instagram link'
      },
      
      // Contact invitation phrases (Turkish)
      {
        pattern: /(ara\s?beni|beni\s?ara|telefon\s?et|arayalım)/gi,
        replacement: '[İletişim talebi güvenlik nedeniyle kaldırıldı]',
        description: 'Contact invitation (Turkish)'
      },
      {
        pattern: /(numaram|numaramı|tel\s?no|telefon\s?numara)/gi,
        replacement: '[Telefon numarası güvenlik nedeniyle kaldırıldı]',
        description: 'Phone number reference (Turkish)'
      },
      {
        pattern: /(whatsapp.*yaz|wp.*yaz|watsap)/gi,
        replacement: '[WhatsApp talebi güvenlik nedeniyle kaldırıldı]',
        description: 'WhatsApp invitation (Turkish)'
      },
      
      // Contact invitation phrases (English)
      {
        pattern: /(call\s?me|phone\s?me|give\s?me\s?a\s?call)/gi,
        replacement: '[Contact request removed for security]',
        description: 'Contact invitation (English)'
      },
      {
        pattern: /(my\s?number\s?is|here\s?is\s?my\s?number)/gi,
        replacement: '[Phone number removed for security]',
        description: 'Phone number sharing (English)'
      },
      {
        pattern: /(text\s?me|message\s?me\s?on)/gi,
        replacement: '[Contact request removed for security]',
        description: 'Message invitation (English)'
      },
      
      // Generic external contact attempts
      {
        pattern: /(dışarıda\s?konuş|platform\s?dışı|buradan\s?değil)/gi,
        replacement: '[Platform dışı iletişim talebi kaldırıldı]',
        description: 'External communication request'
      }
    ]

    let moderatedContent = content
    const flaggedPatterns: string[] = []
    let hasViolations = false

    // Apply moderation patterns
    moderationPatterns.forEach(({ pattern, replacement, description }) => {
      if (pattern.test(moderatedContent)) {
        moderatedContent = moderatedContent.replace(pattern, replacement)
        flaggedPatterns.push(description)
        hasViolations = true
      }
    })

    // Additional inappropriate content detection
    const inappropriateWords = [
      'spam', 'scam', 'fake', 'sahte', 'dolandırıcı', 'hileli',
      'kötü', 'berbat', 'rezalet', 'çöp', 'boktan'
    ]

    const lowerContent = content.toLowerCase()
    inappropriateWords.forEach(word => {
      if (lowerContent.includes(word)) {
        flaggedPatterns.push(`Inappropriate word: ${word}`)
        hasViolations = true
      }
    })

    const response: ModerationResponse = {
      isAppropriate: !hasViolations,
      originalContent: content,
      moderatedContent: moderatedContent,
      flaggedPatterns: flaggedPatterns,
      confidence: hasViolations ? 0.95 : 0.99
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Moderation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})