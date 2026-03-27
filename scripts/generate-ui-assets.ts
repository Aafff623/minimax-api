/**
 * UI Assets Generation Script
 * Generates module icons, empty states, loading animations, covers, and background patterns
 * using MiniMax Image API (image-01)
 *
 * Usage: pnpm run generate:assets
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ============== Config ==============
const API_BASE_URL = 'https://api.minimaxi.com/v1/image_generation'
const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images')

// API Key from environment (user should set MINIMAX_API_KEY)
const API_KEY = process.env.MINIMAX_API_KEY || ''

// ============== Types ==============
interface GenerationRequest {
  model: string
  prompt: string
  aspect_ratio: string
  response_format: 'url' | 'base64'
  n?: number
  seed?: number
}

interface GenerationResult {
  url?: string
  base64?: string
}

// ============== Asset Definitions ==============
const MODULE_NAMES = ['voice', 'image', 'video', 'music', 'chat', 'history'] as const
type ModuleName = typeof MODULE_NAMES[number]

// Module Icons - minimalist flat design icons
const MODULE_ICONS: Record<ModuleName, string> = {
  voice: 'Minimalist icon, voice/speech symbol, flat design, single color, vector style',
  image: 'Minimalist icon, image/photo symbol, flat design, single color, vector style',
  video: 'Minimalist icon, video/camera symbol, flat design, single color, vector style',
  music: 'Minimalist icon, music/notes symbol, flat design, single color, vector style',
  chat: 'Minimalist icon, chat/bubble symbol, flat design, single color, vector style',
  history: 'Minimalist icon, history/clock symbol, flat design, single color, vector style',
}

// Empty State Illustrations - cute isometric illustrations
const EMPTY_STATES: Record<ModuleName, string> = {
  voice: 'Cute empty state illustration, microphone theme, soft colors, isometric, no data placeholder',
  image: 'Cute empty state illustration, picture frame theme, soft colors, isometric, no data placeholder',
  video: 'Cute empty state illustration, film reel theme, soft colors, isometric, no data placeholder',
  music: 'Cute empty state illustration, music note theme, soft colors, isometric, no data placeholder',
  chat: 'Cute empty state illustration, chat bubble theme, soft colors, isometric, no data placeholder',
  history: 'Cute empty state illustration, hourglass theme, soft colors, isometric, no data placeholder',
}

// Loading Animations
const LOADING_ASSETS = {
  spinner: 'Animated loading spinner, gradient circles, smooth loop, modern design',
  skeleton: 'Loading skeleton placeholder, subtle pulse animation, gray tones',
  progress: 'Progress bar animation, gradient fill, smooth transition',
} as const

// Module Covers - 16:9 marketing banners
const MODULE_COVERS: Record<ModuleName, string> = {
  voice: 'Beautiful voice/speech themed cover image, 16:9, marketing banner style, vibrant',
  image: 'Beautiful image/photo themed cover image, 16:9, marketing banner style, vibrant',
  video: 'Beautiful video/camera themed cover image, 16:9, marketing banner style, vibrant',
  music: 'Beautiful music themed cover image, 16:9, marketing banner style, vibrant',
  chat: 'Beautiful chat/AI themed cover image, 16:9, marketing banner style, vibrant',
  history: 'Beautiful history/archive themed cover image, 16:9, marketing banner style, vibrant',
}

// Background Patterns
const BG_PATTERNS = {
  geometric: 'Subtle background pattern, geometric shapes, seamless tile, low contrast',
  dots: 'Subtle background pattern, polka dots, seamless tile, low contrast',
  waves: 'Subtle background pattern, wave lines, seamless tile, low contrast',
} as const

// ============== API Functions ==============
async function generateImage(request: GenerationRequest): Promise<GenerationResult> {
  if (!API_KEY) {
    console.warn('Warning: MINIMAX_API_KEY not set, using placeholder')
    return {}
  }

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== '200') {
      throw new Error(`Generation failed: ${data.msg}`)
    }

    return data.data.items[0]
  } catch (error) {
    console.error('Generation error:', error)
    return {}
  }
}

async function downloadAndSave(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    if (!response.ok) return false

    const buffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    mkdirSync(dirname(filepath), { recursive: true })
    writeFileSync(filepath, uint8Array)
    return true
  } catch (error) {
    console.error('Download error:', error)
    return false
  }
}

// ============== Generation Functions ==============
async function generateModuleIcons(): Promise<void> {
  console.log('\n🎨 Generating Module Icons...')

  for (const module of MODULE_NAMES) {
    const prompt = MODULE_ICONS[module]
    const outputPath = join(OUTPUT_DIR, 'icons', `${module}.webp`)

    console.log(`  → ${module}: ${prompt.substring(0, 40)}...`)

    const result = await generateImage({
      model: 'image-01',
      prompt,
      aspect_ratio: '1:1',
      response_format: 'url',
    })

    if (result.url) {
      const saved = await downloadAndSave(result.url, outputPath)
      if (saved) {
        console.log(`    ✅ Saved: ${outputPath}`)
      }
    }
  }
}

async function generateEmptyStates(): Promise<void> {
  console.log('\n📭 Generating Empty State Illustrations...')

  for (const module of MODULE_NAMES) {
    const prompt = EMPTY_STATES[module]
    const outputPath = join(OUTPUT_DIR, 'empty', `${module}.webp`)

    console.log(`  → ${module}: ${prompt.substring(0, 40)}...`)

    const result = await generateImage({
      model: 'image-01',
      prompt,
      aspect_ratio: '4:3',
      response_format: 'url',
    })

    if (result.url) {
      const saved = await downloadAndSave(result.url, outputPath)
      if (saved) {
        console.log(`    ✅ Saved: ${outputPath}`)
      }
    }
  }
}

async function generateLoadingAnimations(): Promise<void> {
  console.log('\n⏳ Generating Loading Animations...')

  for (const [name, prompt] of Object.entries(LOADING_ASSETS)) {
    const outputPath = join(OUTPUT_DIR, 'loading', `${name}.webp`)

    console.log(`  → ${name}: ${prompt.substring(0, 40)}...`)

    const result = await generateImage({
      model: 'image-01',
      prompt,
      aspect_ratio: '1:1',
      response_format: 'url',
    })

    if (result.url) {
      const saved = await downloadAndSave(result.url, outputPath)
      if (saved) {
        console.log(`    ✅ Saved: ${outputPath}`)
      }
    }
  }
}

async function generateModuleCovers(): Promise<void> {
  console.log('\n🖼️ Generating Module Covers...')

  for (const module of MODULE_NAMES) {
    const prompt = MODULE_COVERS[module]
    const outputPath = join(OUTPUT_DIR, 'covers', `${module}.webp`)

    console.log(`  → ${module}: ${prompt.substring(0, 40)}...`)

    const result = await generateImage({
      model: 'image-01',
      prompt,
      aspect_ratio: '16:9',
      response_format: 'url',
    })

    if (result.url) {
      const saved = await downloadAndSave(result.url, outputPath)
      if (saved) {
        console.log(`    ✅ Saved: ${outputPath}`)
      }
    }
  }
}

async function generateBackgroundPatterns(): Promise<void> {
  console.log('\n🎨 Generating Background Patterns...')

  for (const [name, prompt] of Object.entries(BG_PATTERNS)) {
    const outputPath = join(OUTPUT_DIR, 'bg', `${name}.webp`)

    console.log(`  → ${name}: ${prompt.substring(0, 40)}...`)

    const result = await generateImage({
      model: 'image-01',
      prompt,
      aspect_ratio: '16:9',
      response_format: 'url',
    })

    if (result.url) {
      const saved = await downloadAndSave(result.url, outputPath)
      if (saved) {
        console.log(`    ✅ Saved: ${outputPath}`)
      }
    }
  }
}

// ============== Main ==============
async function main() {
  console.log('========================================')
  console.log('🎨 MiniMax UI Assets Generator')
  console.log('========================================')
  console.log(`📁 Output: ${OUTPUT_DIR}`)
  console.log(`🔑 API Key: ${API_KEY ? 'Set' : 'Not Set (will create placeholders)'}`)
  console.log('========================================')

  if (!API_KEY) {
    console.log('\n⚠️  No API Key provided. Create placeholder files instead.')
  }

  await generateModuleIcons()
  await generateEmptyStates()
  await generateLoadingAnimations()
  await generateModuleCovers()
  await generateBackgroundPatterns()

  console.log('\n========================================')
  console.log('✅ Generation Complete!')
  console.log('========================================\n')
}

main().catch(console.error)
