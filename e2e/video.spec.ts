import { expect, test } from '@playwright/test'

test.describe('Video Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/video')
  })

  test('should navigate to video page', async ({ page }) => {
    await expect(page).toHaveURL(/.*video/)
  })

  test('should display video page title', async ({ page }) => {
    const title = page.locator('h1, h2, .page-title')
    await expect(title.first()).toBeVisible()
  })

  test('should have mode selector', async ({ page }) => {
    const modeSelector = page.locator('select, .mode-selector')
    await expect(modeSelector.first()).toBeVisible()
  })

  test('should have prompt input field', async ({ page }) => {
    const promptInput = page.locator('textarea, input[type="text"]').first()
    await expect(promptInput).toBeVisible()
  })

  test('should have model selector', async ({ page }) => {
    const modelSelect = page.locator('select').first()
    await expect(modelSelect).toBeVisible()
  })

  test('should have generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("生成"), button:has-text("Generate")').first()
    await expect(generateButton).toBeVisible()
  })

  test('should display mode options', async ({ page }) => {
    const modeSelect = page.locator('select').first()
    await modeSelect.click()

    const options = page.locator('select option')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show template selector when applicable', async ({ page }) => {
    // Select a mode first
    const modeSelect = page.locator('select').first()
    if (await modeSelect.isVisible()) {
      await modeSelect.selectOption({ index: 1 })
    }

    // Template selector should appear
    const templateSelector = page.locator('select').nth(1)
    await expect(templateSelector).toBeVisible()
  })
})
