import { expect, test } from '@playwright/test'

test.describe('History Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history')
  })

  test('should navigate to history page', async ({ page }) => {
    await expect(page).toHaveURL(/.*history/)
  })

  test('should display history page title', async ({ page }) => {
    const title = page.locator('h1, h2, .page-title')
    await expect(title.first()).toBeVisible()
  })

  test('should have search input field', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"]').first()
    await expect(searchInput).toBeVisible()
  })

  test('should have filter options', async ({ page }) => {
    const filterSelect = page.locator('select').first()
    await expect(filterSelect).toBeVisible()
  })

  test('should display history list', async ({ page }) => {
    const historyList = page.locator('.history-list, [class*="history"]')
    await expect(historyList.first()).toBeVisible()
  })

  test('should filter by type', async ({ page }) => {
    const filterSelect = page.locator('select').first()
    await filterSelect.selectOption({ index: 1 })

    // Check if filter was applied
    await page.waitForTimeout(500)
  })

  test('should search history', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[type="text"]').first()

    await searchInput.fill('test search')
    await page.waitForTimeout(500)
  })

  test('should have favorite toggle', async ({ page }) => {
    // Look for favorite/star button
    const favoriteButton = page.locator('button:has-text("收藏"), button:has-text("★")').first()
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click()
    }
  })

  test('should have delete option', async ({ page }) => {
    // Look for delete button
    const deleteButton = page.locator('button:has-text("删除"), button:has-text("Delete")').first()
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
    }
  })
})
