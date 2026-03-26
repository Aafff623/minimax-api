import { expect, test } from '@playwright/test'

test.describe('Navigation E2E', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*\//)
  })

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/')

    // Check for nav links
    const navLinks = page.locator('nav a, .nav-link, [class*="menu"] a')
    const count = await navLinks.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/')

    const pages = [
      { path: '/voice', name: 'voice' },
      { path: '/image', name: 'image' },
      { path: '/video', name: 'video' },
      { path: '/music', name: 'music' },
      { path: '/chat', name: 'chat' },
      { path: '/history', name: 'history' },
    ]

    for (const { path } of pages) {
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(path))
    }
  })
})
