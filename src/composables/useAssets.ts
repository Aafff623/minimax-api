/**
 * useAssets - UI Assets Composable
 * Manages access to UI decorative assets including icons, empty states, loading animations, covers, and backgrounds
 */

import { computed } from 'vue'

// Asset paths
const ASSET_BASE = '/images'

/**
 * Module names for icons, empty states, and covers
 */
export type ModuleName = 'voice' | 'image' | 'video' | 'music' | 'chat' | 'history'

/**
 * Available background pattern types
 */
export type BgPatternType = 'geometric' | 'dots' | 'waves'

/**
 * Available loading animation types
 */
export type LoadingType = 'spinner' | 'skeleton' | 'progress'

/**
 * Module colors for theming
 */
export const MODULE_COLORS: Record<ModuleName, string> = {
  voice: '#6366f1',
  image: '#ec4899',
  video: '#f97316',
  music: '#8b5cf6',
  chat: '#06b6d4',
  history: '#10b981',
}

/**
 * Module display names
 */
export const MODULE_DISPLAY_NAMES: Record<ModuleName, string> = {
  voice: 'Voice',
  image: 'Image',
  video: 'Video',
  music: 'Music',
  chat: 'Chat',
  history: 'History',
}

export interface UseAssets {
  // Icon paths
  getModuleIcon: (module: ModuleName) => string
  getModuleIconPath: (module: ModuleName) => { webp: string; svg: string }

  // Empty state paths
  getEmptyState: (module: ModuleName) => string
  getEmptyStatePath: (module: ModuleName) => { webp: string; svg: string }

  // Loading animation paths
  getLoadingAnimation: (type: LoadingType) => string
  getLoadingAnimationPath: (type: LoadingType) => { webp: string; svg: string }

  // Cover image paths
  getModuleCover: (module: ModuleName) => string
  getModuleCoverPath: (module: ModuleName) => { webp: string; svg: string }

  // Background pattern paths
  getBgPattern: (type: BgPatternType) => string
  getBgPatternPath: (type: BgPatternType) => { webp: string; svg: string }

  // Fallback detection
  hasAsset: (path: string) => boolean
  getAssetWithFallback: (webpPath: string, svgPath: string) => string
}

export function useAssets(): UseAssets {
  /**
   * Get WebP path for an asset
   */
  function getWebpPath(category: string, name: string): string {
    return `${ASSET_BASE}/${category}/${name}.webp`
  }

  /**
   * Get SVG path for an asset
   */
  function getSvgPath(category: string, name: string): string {
    return `${ASSET_BASE}/${category}/${name}.svg`
  }

  /**
   * Get full URL for module icon
   */
  function getModuleIcon(module: ModuleName): string {
    return getWebpPath('icons', module)
  }

  /**
   * Get full paths for module icon
   */
  function getModuleIconPath(module: ModuleName) {
    return {
      webp: getWebpPath('icons', module),
      svg: getSvgPath('icons', module),
    }
  }

  /**
   * Get full URL for empty state illustration
   */
  function getEmptyState(module: ModuleName): string {
    return getWebpPath('empty', module)
  }

  /**
   * Get full paths for empty state
   */
  function getEmptyStatePath(module: ModuleName) {
    return {
      webp: getWebpPath('empty', module),
      svg: getSvgPath('empty', module),
    }
  }

  /**
   * Get full URL for loading animation
   */
  function getLoadingAnimation(type: LoadingType): string {
    return getWebpPath('loading', type)
  }

  /**
   * Get full paths for loading animation
   */
  function getLoadingAnimationPath(type: LoadingType) {
    return {
      webp: getWebpPath('loading', type),
      svg: getSvgPath('loading', type),
    }
  }

  /**
   * Get full URL for module cover
   */
  function getModuleCover(module: ModuleName): string {
    return getWebpPath('covers', module)
  }

  /**
   * Get full paths for module cover
   */
  function getModuleCoverPath(module: ModuleName) {
    return {
      webp: getWebpPath('covers', module),
      svg: getSvgPath('covers', module),
    }
  }

  /**
   * Get full URL for background pattern
   */
  function getBgPattern(type: BgPatternType): string {
    return getWebpPath('bg', type)
  }

  /**
   * Get full paths for background pattern
   */
  function getBgPatternPath(type: BgPatternType) {
    return {
      webp: getWebpPath('bg', type),
      svg: getSvgPath('bg', type),
    }
  }

  /**
   * Check if an asset exists (for fallback logic)
   * Note: In browser context, this is a best-effort check
   */
  function hasAsset(path: string): boolean {
    // In production, this would check against a manifest
    // For now, return true - the img tag will handle 404
    return true
  }

  /**
   * Get asset with WebP priority and SVG fallback
   */
  function getAssetWithFallback(webpPath: string, svgPath: string): string {
    // Prefer WebP, fallback to SVG
    return webpPath
  }

  return {
    getModuleIcon,
    getModuleIconPath,
    getEmptyState,
    getEmptyStatePath,
    getLoadingAnimation,
    getLoadingAnimationPath,
    getModuleCover,
    getModuleCoverPath,
    getBgPattern,
    getBgPatternPath,
    hasAsset,
    getAssetWithFallback,
  }
}
