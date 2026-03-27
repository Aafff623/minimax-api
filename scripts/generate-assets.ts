/**
 * Script to generate AI agent images using MiniMax Image-01 API
 *
 * Usage:
 *   pnpm run generate:assets
 *
 * Environment Variables (required):
 *   MINIMAX_API_KEY - Your MiniMax API key
 *   MINIMAX_API_BASE_URL - API base URL (optional, defaults to https://api.minimaxi.com)
 *
 * Output:
 *   public/images/ai-agent-catgirl.webp
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT_DIR, 'public', 'images')
const OUTPUT_PATH = join(OUTPUT_DIR, 'ai-agent-catgirl.webp')

// API Configuration
const API_KEY = process.env.MINIMAX_API_KEY
const API_BASE = process.env.MINIMAX_API_BASE_URL || 'https://api.minimaxi.com'

// Image generation parameters
const IMAGE_PROMPT = 'Anime catgirl character, cute kawaii style, large expressive eyes, pink hair with cat ears, soft pastel colors, digital art, high quality, character design sheet, full body'

interface ImageResponse {
  code: string
  msg: string
  data: {
    items: Array<{
      url?: string
      base64?: string
    }>
  }
}

async function generateImage(): Promise<string | null> {
  if (!API_KEY) {
    console.error('❌ MINIMAX_API_KEY environment variable is required')
    console.error('   Please set your API key: export MINIMAX_API_KEY=your_key_here')
    return null
  }

  console.log('🎨 Generating AI catgirl image using MiniMax Image-01 API...')
  console.log(`📡 API Base: ${API_BASE}`)

  try {
    const response = await fetch(`${API_BASE}/v1/image_generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'image-01',
        prompt: IMAGE_PROMPT,
        aspect_ratio: '1:1',
        n: 1,
        response_format: 'url'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${response.status} - ${errorText}`)
      return null
    }

    const data: ImageResponse = await response.json()

    if (data.code !== '200') {
      console.error(`❌ API Error: ${data.code} - ${data.msg}`)
      return null
    }

    const imageUrl = data.data.items[0]?.url
    if (!imageUrl) {
      console.error('❌ No image URL in response')
      return null
    }

    console.log(`✅ Image generated: ${imageUrl}`)
    return imageUrl

  } catch (error) {
    console.error('❌ Network error:', error instanceof Error ? error.message : String(error))
    return null
  }
}

async function downloadImage(url: string): Promise<Buffer | null> {
  console.log('📥 Downloading image...')

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`❌ Download failed: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)

  } catch (error) {
    console.error('❌ Download error:', error instanceof Error ? error.message : String(error))
    return null
  }
}

async function main() {
  console.log('\n========================================')
  console.log('   MiniMax Image Generator Script')
  console.log('========================================\n')

  // Check if output directory exists, create if not
  if (!existsSync(OUTPUT_DIR)) {
    console.log('📁 Creating output directory...')
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Generate image
  const imageUrl = await generateImage()
  if (!imageUrl) {
    console.log('\n⚠️  Image generation failed.')
    console.log('   Creating placeholder SVG instead...\n')
    createPlaceholderImage()
    return
  }

  // Download image
  const imageBuffer = await downloadImage(imageUrl)
  if (!imageBuffer) {
    console.log('\n⚠️  Image download failed.')
    console.log('   Creating placeholder SVG instead...\n')
    createPlaceholderImage()
    return
  }

  // Save as WebP (or PNG if conversion not available)
  try {
    // For simplicity, we'll save as PNG with .webp extension
    // In production, you'd use sharp or similar for conversion
    const outputPath = OUTPUT_PATH.replace('.webp', '.png')
    writeFileSync(outputPath, imageBuffer)
    console.log(`\n✅ Image saved to: ${outputPath}`)
    console.log('\n========================================')
    console.log('   Generation Complete!')
    console.log('========================================\n')
  } catch (error) {
    console.error('❌ Save error:', error instanceof Error ? error.message : String(error))
    createPlaceholderImage()
  }
}

function createPlaceholderImage() {
  console.log('🎨 Creating SVG placeholder...')

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#DDA0DD;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B0C4DE;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="earGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF69B4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFB6C1;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bgGradient)" rx="32"/>

  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="60" fill="#FF69B4" opacity="0.2"/>
  <circle cx="412" cy="150" r="80" fill="#DDA0DD" opacity="0.25"/>
  <circle cx="80" cy="400" r="100" fill="#B0C4DE" opacity="0.2"/>
  <circle cx="420" cy="420" r="70" fill="#FFB6C1" opacity="0.25"/>

  <!-- Cat ears -->
  <path d="M156 180 L130 80 L200 140 Z" fill="url(#earGradient)" stroke="#FF1493" stroke-width="3"/>
  <path d="M356 180 L382 80 L312 140 Z" fill="url(#earGradient)" stroke="#FF1493" stroke-width="3"/>
  <!-- Inner ears -->
  <path d="M155 165 L140 100 L180 145 Z" fill="#FFB6C1"/>
  <path d="M357 165 L372 100 L332 145 Z" fill="#FFB6C1"/>

  <!-- Face -->
  <ellipse cx="256" cy="280" rx="140" ry="160" fill="#FFF5F5" stroke="#FFB6C1" stroke-width="3"/>

  <!-- Eyes -->
  <ellipse cx="200" cy="260" rx="35" ry="40" fill="#FF69B4" filter="url(#glow)"/>
  <ellipse cx="312" cy="260" rx="35" ry="40" fill="#FF69B4" filter="url(#glow)"/>
  <ellipse cx="200" cy="265" rx="20" ry="25" fill="#FFFFFF"/>
  <ellipse cx="312" cy="265" rx="20" ry="25" fill="#FFFFFF"/>
  <ellipse cx="205" cy="260" rx="8" ry="10" fill="#4A4A4A"/>
  <ellipse cx="317" cy="260" rx="8" ry="10" fill="#4A4A4A"/>
  <!-- Eye sparkles -->
  <circle cx="198" cy="252" r="4" fill="#FFFFFF"/>
  <circle cx="310" cy="252" r="4" fill="#FFFFFF"/>

  <!-- Blush -->
  <ellipse cx="145" cy="310" rx="25" ry="12" fill="#FFB6C1" opacity="0.6"/>
  <ellipse cx="367" cy="310" rx="25" ry="12" fill="#FFB6C1" opacity="0.6"/>

  <!-- Nose -->
  <path d="M256 300 L248 315 L264 315 Z" fill="#FF69B4"/>

  <!-- Mouth -->
  <path d="M236 330 Q256 350 276 330" fill="none" stroke="#FF1493" stroke-width="3" stroke-linecap="round"/>

  <!-- Whiskers -->
  <line x1="100" y1="290" x2="160" y2="300" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round"/>
  <line x1="100" y1="310" x2="160" y2="310" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round"/>
  <line x1="100" y1="330" x2="160" y2="320" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round"/>
  <line x1="412" y1="300" x2="352" y2="290" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round"/>
  <line x1="412" y1="310" x2="352" y2="310" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round"/>
  <line x1="412" y1="320" x2="352" y2="330" stroke="#FFB6C1" stroke-width="2" stroke-linecap="round"/>

  <!-- Hair strands -->
  <path d="M180 140 Q200 200 180 250" fill="none" stroke="#FF69B4" stroke-width="8" stroke-linecap="round"/>
  <path d="M220 130 Q235 190 225 240" fill="none" stroke="#FF1493" stroke-width="6" stroke-linecap="round"/>
  <path d="M332 130 Q317 190 327 240" fill="none" stroke="#FF1493" stroke-width="6" stroke-linecap="round"/>
  <path d="M380 140 Q360 200 380 250" fill="none" stroke="#FF69B4" stroke-width="8" stroke-linecap="round"/>

  <!-- Bow -->
  <path d="M220 150 Q256 170 292 150 Q256 180 220 150" fill="#FF1493"/>
  <circle cx="256" cy="160" r="10" fill="#FF69B4"/>
</svg>`

  try {
    writeFileSync(OUTPUT_PATH, svgContent, 'utf-8')
    console.log(`✅ SVG placeholder saved to: ${OUTPUT_PATH}`)
  } catch (error) {
    console.error('❌ Failed to save SVG:', error instanceof Error ? error.message : String(error))
  }

  console.log('\n========================================')
  console.log('   Placeholder Created!')
  console.log('========================================\n')
  console.log('To generate a real image:')
  console.log('1. Set your API key: export MINIMAX_API_KEY=your_key_here')
  console.log('2. Run: pnpm run generate:assets\n')
}

// Run if executed directly
main().catch(console.error)

// Export for testing
export { generateImage, downloadImage, createPlaceholderImage }
