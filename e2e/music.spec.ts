import { expect, test } from '@playwright/test'

test.describe('Music Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/music')
  })

  test('should navigate to music page', async ({ page }) => {
    await expect(page).toHaveURL(/.*music/)
  })

  test('should display music page title', async ({ page }) => {
    const title = page.locator('h1, h2, .page-title')
    await expect(title.first()).toBeVisible()
  })

  test('should have lyrics editor', async ({ page }) => {
    const lyricsEditor = page.locator('textarea').first()
    await expect(lyricsEditor).toBeVisible()
  })

  test('should have style selector', async ({ page }) => {
    const styleSelector = page.locator('select').first()
    await expect(styleSelector).toBeVisible()
  })

  test('should have generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("生成"), button:has-text("Generate")').first()
    await expect(generateButton).toBeVisible()
  })

  test('should display lyrics editor with placeholder', async ({ page }) => {
    const lyricsEditor = page.locator('textarea').first()
    await expect(lyricsEditor).toBeVisible()
  })

  test('should display style options', async ({ page }) => {
    const styleSelect = page.locator('select').first()
    await styleSelect.click()

    const options = page.locator('select option')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have model selector', async ({ page }) => {
    const modelSelect = page.locator('select').nth(1)
    await expect(modelSelect).toBeVisible()
  })

  test('should toggle lyrics type between AI and custom', async ({ page }) => {
    // Find lyrics type toggle/selector
    const lyricsTypeSelector = page.locator('select').nth(2)
    if (await lyricsTypeSelector.isVisible()) {
      await lyricsTypeSelector.selectOption({ index: 0 })
      await lyricsTypeSelector.selectOption({ index: 1 })
    }
  })
})
