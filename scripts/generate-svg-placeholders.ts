/**
 * SVG Placeholder Generator
 * Creates SVG placeholders for all UI asset types
 * These are used when actual images are not available
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUTPUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images')

// ============== SVG Templates ==============

function createModuleIcon(name: string, color: string): string {
  const icons: Record<string, string> = {
    voice: `<path d="M12 2C9.243 2 7 4.243 7 7v6c0 2.757 2.243 5 5 5s5-2.243 5-5V7c0-2.757-2.243-5-5-5zm3 11c0 1.654-1.346 3-3 3s-3-1.346-3-3v-1c0-1.654 1.346-3 3-3s3 1.346 3 3v1z" fill="currentColor"/><path d="M12 18c2.206 0 4-1.794 4-4h-8c0 2.206 1.794 4 4 4z" fill="currentColor"/>`,
    image: `<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="2" fill="none"/>`,
    video: `<rect x="2" y="4" width="15" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 8l4 4-4 4V8z" fill="currentColor"/>`,
    music: `<path d="M9 18V6l12-3v12" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="15" r="3" fill="currentColor"/>`,
    chat: `<path d="M21 15c0 3.866-3.134 7-7 7H7l-4 4V7c0-3.866 3.134-7 7-7h7c3.866 0 7 3.134 7 7v8z" fill="none" stroke="currentColor" stroke-width="2"/>`,
    history: `<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" fill="none"/>`,
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none">
  <g color="${color}">${icons[name] || icons.chat}</g>
</svg>`
}

function createEmptyState(name: string, theme: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" width="200" height="150">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc"/>
      <stop offset="100%" style="stop-color:#e2e8f0"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="200" height="150" fill="url(#bg)"/>

  <!-- Decorative elements -->
  <circle cx="30" cy="30" r="20" fill="url(#accent)" opacity="0.1"/>
  <circle cx="170" cy="120" r="25" fill="url(#accent)" opacity="0.1"/>

  <!-- Main illustration placeholder -->
  <g transform="translate(100, 75)">
    <!-- Placeholder box -->
    <rect x="-40" y="-30" width="80" height="60" rx="8" fill="none" stroke="url(#accent)" stroke-width="2" stroke-dasharray="4 2"/>

    <!-- Question mark -->
    <text x="0" y="8" text-anchor="middle" font-family="system-ui" font-size="32" fill="url(#accent)" opacity="0.5">?</text>
  </g>

  <!-- Text -->
  <text x="100" y="135" text-anchor="middle" font-family="system-ui" font-size="12" fill="#64748b">
    No ${theme} data
  </text>
</svg>`
}

function createLoadingSpinner(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50">
  <defs>
    <linearGradient id="spinner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <circle cx="25" cy="25" r="20" fill="none" stroke="#e2e8f0" stroke-width="4"/>
  <circle cx="25" cy="25" r="20" fill="none" stroke="url(#spinner-grad)" stroke-width="4"
    stroke-dasharray="80 40" stroke-linecap="round">
    <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" from="0 25 25" to="360 25 25"/>
  </circle>
</svg>`
}

function createLoadingSkeleton(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100">
  <defs>
    <linearGradient id="skeleton-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e2e8f0"/>
      <stop offset="50%" style="stop-color:#f1f5f9"/>
      <stop offset="100%" style="stop-color:#e2e8f0"/>
    </linearGradient>
  </defs>

  <rect x="10" y="10" width="60" height="60" rx="8" fill="url(#skeleton-grad)">
    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
  </rect>

  <rect x="80" y="15" width="110" height="12" rx="4" fill="url(#skeleton-grad)">
    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.1s" repeatCount="indefinite"/>
  </rect>

  <rect x="80" y="35" width="80" height="10" rx="4" fill="url(#skeleton-grad)">
    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>
  </rect>

  <rect x="80" y="53" width="60" height="10" rx="4" fill="url(#skeleton-grad)">
    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
  </rect>
</svg>`
}

function createProgressBar(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 20" width="200" height="20">
  <defs>
    <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
    <linearGradient id="track-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e2e8f0"/>
      <stop offset="100%" style="stop-color:#f1f5f9"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="200" height="20" rx="10" fill="url(#track-grad)"/>

  <rect x="0" y="0" width="140" height="20" rx="10" fill="url(#progress-grad)">
    <animate attributeName="width" values="0;140;0" dur="2s" repeatCount="indefinite"/>
  </rect>
</svg>`
}

function createModuleCover(name: string, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
  <defs>
    <linearGradient id="cover-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color}"/>
      <stop offset="100%" style="stop-color:${color}99"/>
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:transparent"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.3)"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="320" height="180" fill="url(#cover-bg)"/>

  <!-- Pattern overlay -->
  <g opacity="0.1" fill="white">
    <circle cx="40" cy="40" r="60"/>
    <circle cx="280" cy="140" r="80"/>
    <circle cx="160" cy="90" r="40"/>
  </g>

  <!-- Bottom overlay -->
  <rect y="100" width="320" height="80" fill="url(#overlay)"/>

  <!-- Title -->
  <text x="20" y="145" font-family="system-ui" font-size="24" font-weight="bold" fill="white">
    ${name.charAt(0).toUpperCase() + name.slice(1)}
  </text>
</svg>`
}

function createBgPattern(type: string): string {
  const patterns: Record<string, string> = {
    geometric: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <pattern id="geo" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#f8fafc"/>
      <rect x="5" y="5" width="10" height="10" fill="#e2e8f0" rx="2"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#geo)"/>
</svg>`,

    dots: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="100" height="100">
  <defs>
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <rect width="20" height="20" fill="#f8fafc"/>
      <circle cx="10" cy="10" r="2" fill="#cbd5e1"/>
    </pattern>
  </defs>
  <rect width="100" height="100" fill="url(#dots)"/>
</svg>`,

    waves: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" width="100" height="50" preserveAspectRatio="none">
  <defs>
    <pattern id="waves" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
      <rect width="100" height="50" fill="#f8fafc"/>
      <path d="M0 25 Q25 15 50 25 T100 25" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="100" height="50" fill="url(#waves)"/>
</svg>`,
  }

  return patterns[type] || patterns.geometric
}

// ============== Color schemes for modules ==============
const moduleColors: Record<string, string> = {
  voice: '#6366f1',   // Indigo
  image: '#ec4899',   // Pink
  video: '#f97316',   // Orange
  music: '#8b5cf6',   // Purple
  chat: '#06b6d4',    // Cyan
  history: '#10b981', // Emerald
}

// ============== Main ==============
function main() {
  console.log('🎨 Generating SVG Placeholders...')

  // Module Icons
  console.log('  📁 icons/')
  for (const [name, color] of Object.entries(moduleColors)) {
    const svg = createModuleIcon(name, color)
    const path = join(OUTPUT_DIR, 'icons', `${name}.svg`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, svg)
    console.log(`    ✅ ${name}.svg`)
  }

  // Empty States
  console.log('  📁 empty/')
  for (const name of ['voice', 'image', 'video', 'music', 'chat', 'history']) {
    const svg = createEmptyState(name, name)
    const path = join(OUTPUT_DIR, 'empty', `${name}.svg`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, svg)
    console.log(`    ✅ ${name}.svg`)
  }

  // Loading Animations
  console.log('  📁 loading/')
  const loaders = [
    ['spinner', createLoadingSpinner],
    ['skeleton', createLoadingSkeleton],
    ['progress', createProgressBar],
  ]
  for (const [name, creator] of loaders) {
    const svg = creator()
    const path = join(OUTPUT_DIR, 'loading', `${name}.svg`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, svg)
    console.log(`    ✅ ${name}.svg`)
  }

  // Module Covers
  console.log('  📁 covers/')
  for (const [name, color] of Object.entries(moduleColors)) {
    const svg = createModuleCover(name, color)
    const path = join(OUTPUT_DIR, 'covers', `${name}.svg`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, svg)
    console.log(`    ✅ ${name}.svg`)
  }

  // Background Patterns
  console.log('  📁 bg/')
  for (const type of ['geometric', 'dots', 'waves']) {
    const svg = createBgPattern(type)
    const path = join(OUTPUT_DIR, 'bg', `${type}.svg`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, svg)
    console.log(`    ✅ ${type}.svg`)
  }

  console.log('\n✅ SVG Placeholders Complete!')
}

main()
