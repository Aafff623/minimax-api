/**
 * BGM Music Generation Script
 *
 * This script generates 3 background music tracks using the MiniMax Music API.
 * Since actual generation requires API credits, this script:
 * 1. Creates placeholder silent audio files (WAV format)
 * 2. Optionally calls the MiniMax API if API_KEY is set
 *
 * Usage:
 *   pnpm run generate-music        # Generate placeholder files only
 *   API_KEY=your_key pnpm generate-music  # Generate actual music
 *
 * Output:
 *   public/bgm/peaceful-morning.mp3
 *   public/bgm/focus-flow.mp3
 *   public/bgm/creative-vibes.mp3
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, '..', 'public', 'bgm')

// Track definitions
const TRACKS = [
  {
    id: 'peaceful-morning',
    filename: 'peaceful-morning.mp3',
    title: 'Peaceful Morning',
    artist: 'MiniMax BGM',
    prompt: 'Lo-fi hip hop, chill, relaxed, morning vibes, coffee shop background, soft piano, warm sunshine, study beats, 80 BPM',
    duration: 180, // 3 minutes
  },
  {
    id: 'focus-flow',
    filename: 'focus-flow.mp3',
    title: 'Focus Flow',
    artist: 'MiniMax BGM',
    prompt: 'Ambient electronic, focus music, minimal, clean, concentration, deep work, subtle synth pad, 70 BPM',
    duration: 240, // 4 minutes
  },
  {
    id: 'creative-vibes',
    filename: 'creative-vibes.mp3',
    title: 'Creative Vibes',
    artist: 'MiniMax BGM',
    prompt: 'Indie pop, uplifting, creative mood, positive energy, acoustic guitar, light percussion, inspiring, 100 BPM',
    duration: 200, // 3:20
  },
]

/**
 * Generate a silent WAV file as placeholder
 * WAV format: RIFF header + fmt chunk + data chunk
 */
function generateSilentWav(durationSeconds: number, sampleRate = 44100, channels = 2, bitsPerSample = 16): Buffer {
  const numSamples = sampleRate * durationSeconds
  const dataSize = numSamples * channels * (bitsPerSample / 8)
  const fileSize = 36 + dataSize // Total file size minus 8 bytes for RIFF header

  const buffer = Buffer.alloc(44 + dataSize)
  let offset = 0

  // RIFF header
  buffer.write('RIFF', offset); offset += 4
  buffer.writeUInt32LE(fileSize, offset); offset += 4
  buffer.write('WAVE', offset); offset += 4

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4
  buffer.writeUInt32LE(16, offset); offset += 4 // Chunk size
  buffer.writeUInt16LE(1, offset); offset += 2  // Audio format (PCM)
  buffer.writeUInt16LE(channels, offset); offset += 2
  buffer.writeUInt32LE(sampleRate, offset); offset += 4
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), offset); offset += 4 // Byte rate
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), offset); offset += 2 // Block align
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2

  // data chunk
  buffer.write('data', offset); offset += 4
  buffer.writeUInt32LE(dataSize, offset); offset += 4

  // Silent audio data (zeros)
  // Already initialized to 0, just return
  return buffer
}

/**
 * Generate a simple beep tone as placeholder (more distinguishable than silence)
 */
function generateToneWav(durationSeconds: number, frequency = 440, sampleRate = 44100, channels = 2, bitsPerSample = 16): Buffer {
  const numSamples = sampleRate * durationSeconds
  const dataSize = numSamples * channels * (bitsPerSample / 8)
  const fileSize = 36 + dataSize

  const buffer = Buffer.alloc(44 + dataSize)
  let offset = 0

  // RIFF header
  buffer.write('RIFF', offset); offset += 4
  buffer.writeUInt32LE(fileSize, offset); offset += 4
  buffer.write('WAVE', offset); offset += 4

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4
  buffer.writeUInt32LE(16, offset); offset += 4
  buffer.writeUInt16LE(1, offset); offset += 2
  buffer.writeUInt16LE(channels, offset); offset += 2
  buffer.writeUInt32LE(sampleRate, offset); offset += 4
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), offset); offset += 4
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), offset); offset += 2
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2

  // data chunk
  buffer.write('data', offset); offset += 4
  buffer.writeUInt32LE(dataSize, offset); offset += 4

  // Generate sine wave
  const amplitude = 16000 // Moderate volume
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    // Envelope: fade in/out to avoid clicks
    let envelope = 1
    const fadeTime = 0.05 // 50ms fade
    if (t < fadeTime) envelope = t / fadeTime
    else if (t > durationSeconds - fadeTime) envelope = (durationSeconds - t) / fadeTime

    const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude * envelope
    const intSample = Math.round(sample)

    // Write for each channel (mono signal duplicated)
    for (let c = 0; c < channels; c++) {
      buffer.writeInt16LE(intSample, offset)
      offset += 2
    }
  }

  return buffer
}

/**
 * Generate placeholder audio files
 */
async function generatePlaceholders() {
  console.log('🎵 Generating placeholder audio files...\n')

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  for (const track of TRACKS) {
    const filepath = join(OUTPUT_DIR, track.filename.replace('.mp3', '.wav'))

    // Use different tones for each track to distinguish them
    const frequencies = [262, 330, 392] // C4, E4, G4 (C major chord)
    const trackIndex = TRACKS.indexOf(track)
    const freq = frequencies[trackIndex]

    console.log(`  Generating ${track.filename} (${track.duration}s, ${freq}Hz)...`)
    const wavBuffer = generateToneWav(track.duration, freq, 44100, 2, 16)
    writeFileSync(filepath, wavBuffer)
    console.log(`    ✓ Created: ${filepath}`)
  }

  console.log('\n✅ Placeholder files generated successfully!')
  console.log(`📁 Output directory: ${OUTPUT_DIR}`)
}

/**
 * Call MiniMax Music API to generate actual music
 */
async function generateWithAPI(apiKey: string) {
  console.log('🎼 Generating music with MiniMax API...\n')

  for (const track of TRACKS) {
    console.log(`  Generating ${track.title}...`)

    try {
      const response = await fetch('https://api.minimax.com/v1/music_generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'music-2.0',
          prompt: track.prompt,
          output_format: 'url',
          audio_setting: {
            sample_rate: 44100,
            bitrate: 256000,
            format: 'mp3',
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error(`    ❌ Failed: ${error.message || response.statusText}`)
        continue
      }

      const data = await response.json()

      if (data.data?.audio_url) {
        console.log(`    ✓ Got audio URL: ${data.data.audio_url}`)

        // Download the audio file
        const audioResponse = await fetch(data.data.audio_url)
        if (audioResponse.ok) {
          const audioBuffer = await audioResponse.arrayBuffer()
          const filepath = join(OUTPUT_DIR, track.filename)
          writeFileSync(filepath, Buffer.from(audioBuffer))
          console.log(`    ✓ Saved: ${filepath}`)
        }
      } else if (data.data?.hex) {
        console.log(`    ✓ Got hex data, converting...`)
        // Convert hex to audio and save
        const filepath = join(OUTPUT_DIR, track.filename)
        // Note: hex conversion would need proper implementation
        console.log(`    ⚠ Hex format not fully implemented, please use URL format`)
      }
    } catch (error) {
      console.error(`    ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  console.log('\n🎉 Music generation complete!')
}

// Main execution
const apiKey = process.env.API_KEY

if (apiKey) {
  generateWithAPI(apiKey)
} else {
  console.log('ℹ️  No API_KEY found in environment.')
  console.log('   Generating placeholder files only...\n')
  generatePlaceholders()
}

console.log('\n📋 Track Summary:')
for (const track of TRACKS) {
  console.log(`   ${track.id}: "${track.title}" - ${track.prompt.substring(0, 50)}...`)
}
