import { expect, test } from '@playwright/test'

test.describe('Image Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image')
  })

  test('should navigate to image page', async ({ page }) => {
    await expect(page).toHaveURL(/.*image/)
  })

  test('should display image page title', async ({ page }) => {
    const title = page.locator('h1, h2, .page-title')
    await expect(title.first()).toBeVisible()
  })

  test('should have prompt input field', async ({ page }) => {
    const promptInput = page.locator('textarea, input[type="text"]').first()
    await expect(promptInput).toBeVisible()
  })

  test('should have size selector', async ({ page }) => {
    const sizeSelector = page.locator('select').first()
    await expect(sizeSelector).toBeVisible()
  })

  test('should have style selector', async ({ page }) => {
    // Look for style-related selectors
    const styleSelector = page.locator('select').nth(1)
    await expect(styleSelector).toBeVisible()
  })

  test('should have generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("生成"), button:has-text("Generate")').first()
    await expect(generateButton).toBeVisible()
  })

  test('should display size options', async ({ page }) => {
    const sizeSelect = page.locator('select').first()
    await sizeSelect.click()

    const options = page.locator('select option')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display gallery section', async ({ page }) => {
    const gallery = page.locator('.gallery, [class*="gallery"]')
    await expect(gallery.first()).toBeVisible()
  })
})
