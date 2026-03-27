/**
 * Welcome Video Generation Script
 *
 * This script generates a welcome video using the MiniMax-Hailuo-02 API.
 * Since actual generation requires API credits and a reference image, this script:
 * 1. Creates a placeholder animated file
 * 2. Optionally calls the MiniMax API if API_KEY is set
 *
 * Usage:
 *   pnpm run generate-welcome-video        # Generate placeholder only
 *   API_KEY=your_key pnpm generate-welcome-video  # Generate actual video
 *
 * Output:
 *   public/videos/welcome.mp4
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '..', 'public', 'videos')
const OUTPUT_FILE = join(OUTPUT_DIR, 'welcome.mp4')

// Video generation parameters
const VIDEO_PARAMS = {
  model: 'MiniMax-Hailuo-02',
  prompt: 'Logo animation, smooth fade-in, particles floating, futuristic tech feel, professional brand intro, cinematic lighting, [推进] camera movement',
  duration: 10, // seconds (768P supports 10s)
  resolution: '768P',
}

/**
 * Generate a minimal MP4 placeholder
 * This creates a very basic video file structure that browsers can recognize
 * Note: This is NOT a valid MP4, just a placeholder marker file
 */
function generatePlaceholderFile(): Buffer {
  // Create a simple placeholder text file that indicates where the video should be
  const content = `# Welcome Video Placeholder

This is a placeholder for the welcome video.

To generate the actual video:

1. Set up your API key:
   API_KEY=your_key pnpm generate-welcome-video

2. Or manually:
   - Upload an image to a public URL
   - Call the MiniMax Video API with:
     - model: ${VIDEO_PARAMS.model}
     - last_frame_image: your_image_url
     - prompt: "${VIDEO_PARAMS.prompt}"
     - duration: ${VIDEO_PARAMS.duration}
     - resolution: ${VIDEO_PARAMS.resolution}

3. Download the generated video to:
   ${OUTPUT_FILE}

Generation Parameters:
${JSON.stringify(VIDEO_PARAMS, null, 2)}
`
  return Buffer.from(content, 'utf-8')
}

/**
 * Call MiniMax Video API to generate actual video
 */
async function generateWithAPI(apiKey: string, lastFrameImageUrl: string) {
  console.log('🎬 Generating welcome video with MiniMax API...')
  console.log(`   Model: ${VIDEO_PARAMS.model}`)
  console.log(`   Duration: ${VIDEO_PARAMS.duration}s`)
  console.log(`   Resolution: ${VIDEO_PARAMS.resolution}\n`)

  try {
    const response = await fetch('https://api.minimax.com/v1/video_generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VIDEO_PARAMS.model,
        last_frame_image: lastFrameImageUrl,
        prompt: VIDEO_PARAMS.prompt,
        duration: VIDEO_PARAMS.duration,
        resolution: VIDEO_PARAMS.resolution,
        aigc_watermark: false,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error(`❌ API Error: ${error.message || response.statusText}`)
      return null
    }

    const data = await response.json()
    console.log(`✓ Task created: ${data.data?.task_id}`)

    if (data.data?.task_id) {
      return data.data.task_id
    }

    return null
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return null
  }
}

/**
 * Poll for video generation status
 */
async function pollVideoStatus(apiKey: string, taskId: string, maxAttempts = 100, intervalMs = 3000): Promise<string | null> {
  console.log(`\n🔄 Polling for task status (${taskId})...`)

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(
        `https://api.minimax.com/v1/video_generation?task_id=${encodeURIComponent(taskId)}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      )

      if (!response.ok) {
        console.error(`❌ Status check failed: ${response.statusText}`)
        await sleep(intervalMs)
        continue
      }

      const data = await response.json()
      const status = data.data?.status

      console.log(`   Attempt ${i + 1}/${maxAttempts}: ${status}`)

      if (status === 'success') {
        return data.data?.video_url || null
      }

      if (status === 'failed') {
        console.error('❌ Video generation failed')
        return null
      }

      // pending or processing - wait and retry
      await sleep(intervalMs)
    } catch (error) {
      console.error(`❌ Polling error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      await sleep(intervalMs)
    }
  }

  console.error('❌ Polling timeout')
  return null
}

/**
 * Download video from URL and save to file
 */
async function downloadVideo(videoUrl: string): Promise<boolean> {
  console.log(`\n📥 Downloading video from: ${videoUrl}`)

  try {
    const response = await fetch(videoUrl)

    if (!response.ok) {
      console.error(`❌ Download failed: ${response.statusText}`)
      return false
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (!existsSync(OUTPUT_DIR)) {
      mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    writeFileSync(OUTPUT_FILE, buffer)
    console.log(`✓ Saved to: ${OUTPUT_FILE}`)
    return true
  } catch (error) {
    console.error(`❌ Download error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate placeholder file
 */
function generatePlaceholder(): void {
  console.log('📝 Generating welcome video placeholder...\n')

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const placeholder = generatePlaceholderFile()
  writeFileSync(OUTPUT_FILE.replace('.mp4', '.txt'), placeholder)

  console.log(`✓ Created placeholder: ${OUTPUT_FILE.replace('.mp4', '.txt')}`)
  console.log('\n⚠️  Note: This is NOT an actual video file.')
  console.log('   To generate the real welcome video:')
  console.log('   1. Get a reference image URL (last_frame_image)')
  console.log('   2. Set API_KEY and call with the image URL')
}

// Main execution
const apiKey = process.env.API_KEY
const lastFrameImageUrl = process.env.LAST_FRAME_IMAGE_URL

if (apiKey && lastFrameImageUrl) {
  console.log('🚀 Running with API key...\n')

  generateWithAPI(apiKey, lastFrameImageUrl).then(async (taskId) => {
    if (taskId) {
      const videoUrl = await pollVideoStatus(apiKey, taskId)
      if (videoUrl) {
        await downloadVideo(videoUrl)
      }
    }
    console.log('\n✅ Done!')
  })
} else if (apiKey) {
  console.log('⚠️  API_KEY provided but LAST_FRAME_IMAGE_URL is missing.')
  console.log('   Please provide a public image URL as LAST_FRAME_IMAGE_URL')
  console.log('   Example: LAST_FRAME_IMAGE_URL=https://example.com/logo.jpg pnpm generate-welcome-video\n')
  generatePlaceholder()
} else {
  console.log('ℹ️  No API_KEY found. Generating placeholder...\n')
  generatePlaceholder()
}

console.log(`
📋 Video Parameters:
   Model: ${VIDEO_PARAMS.model}
   Prompt: "${VIDEO_PARAMS.prompt}"
   Duration: ${VIDEO_PARAMS.duration}s
   Resolution: ${VIDEO_PARAMS.resolution}
`)
