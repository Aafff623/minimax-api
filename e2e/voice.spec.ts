import { expect, test } from '@playwright/test'

test.describe('Voice Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/voice')
  })

  test('should navigate to voice page', async ({ page }) => {
    await expect(page).toHaveURL(/.*voice/)
  })

  test('should display voice page title', async ({ page }) => {
    const title = page.locator('h1, h2, .page-title')
    await expect(title.first()).toBeVisible()
  })

  test('should have text input field', async ({ page }) => {
    const textInput = page.locator('textarea, input[type="text"]').first()
    await expect(textInput).toBeVisible()
  })

  test('should have model selector', async ({ page }) => {
    const modelSelect = page.locator('select').first()
    await expect(modelSelect).toBeVisible()
  })

  test('should have generate button', async ({ page }) => {
    const generateButton = page.locator('button:has-text("生成"), button:has-text("Generate")').first()
    await expect(generateButton).toBeVisible()
  })

  test('should display voice model options', async ({ page }) => {
    const modelSelect = page.locator('select').first()
    await modelSelect.click()

    // Check for model options
    const options = page.locator('select option')
    const count = await options.count()
    expect(count).toBeGreaterThan(0)
  })
})
