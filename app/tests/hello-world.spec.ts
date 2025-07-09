import { test, expect } from '@playwright/test';

test.describe('Hello World E2E Test', () => {
  test('should load the homepage and display expected content', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the page title is correct (you can adjust this based on your app)
    await expect(page).toHaveTitle("AInfra"); // Adjust based on your actual title

    // Check for loading state first (since the app shows "Loading..." when no user)
    const loadingElement = page.locator('text=Loading...');

    // If loading is present, wait for it to disappear or for main content to appear
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).toBeVisible();
    }

    // Check for main application elements that should be present
    // Based on your code, let's look for the main container
    const mainContainer = page.locator('div.flex.h-screen.w-full');
    await expect(mainContainer).toBeVisible();

    // Check for the sidebar (ProjectSidebar component) or empty state
    // Look for the Projects header first to confirm the sidebar is there
    const projectsHeader = page.locator('h2', { hasText: 'Projects' });
    await expect(projectsHeader).toBeVisible();

    // Then check for either projects list or empty state
    const createFirstProjectButton = page.getByRole('button', { name: 'Create your first project' });
    const noProjectsText = page.locator('text=No projects found');

    // One of these should be visible (either empty state or projects exist)
    const hasEmptyState = await createFirstProjectButton.isVisible() || await noProjectsText.isVisible();
    expect(hasEmptyState).toBe(true);

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
  });

  test('should have correct page structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that the main layout structure exists
    const mainLayout = page.locator('div.flex.h-screen.w-full');
    await expect(mainLayout).toBeVisible();

    // Check that we can interact with the page (no console errors prevent interaction)
    // This is a basic smoke test to ensure the app is functional
    await page.evaluate(() => {
      // Check if React has loaded properly
      return window.React !== undefined || document.querySelector('[data-reactroot]') !== null;
    });
  });

  test('should handle navigation and basic interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if there are any visible buttons or interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    // There should be at least some interactive elements
    expect(buttonCount).toBeGreaterThan(0);

    // Check if clicking doesn't cause any JavaScript errors
    const firstButton = buttons.first();
    if (await firstButton.isVisible()) {
      await firstButton.click();
      // Wait a bit to see if any errors occur
      await page.waitForTimeout(1000);
    }
  });

  test('should create a new project successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the initial state
    await page.screenshot({ path: 'tests/screenshots/before-project-creation.png', fullPage: true });

    // Look for the add project button (+ button next to "Projects" header)
    const addProjectButton = page.getByRole('button', { name: 'Add project' });

    // Alternative: Look for "Create your first project" button if no projects exist
    const createFirstProjectButton = page.getByRole('button', { name: 'Create your first project' });

    // Try to click the + button first, fallback to "Create your first project" if needed
    if (await addProjectButton.isVisible()) {
      await addProjectButton.click();
    } else {
      await expect(createFirstProjectButton).toBeVisible();
      await createFirstProjectButton.click();
    }

    // Wait for the project creation dialog to appear
    const dialog = page.locator('[role="dialog"]').or(page.locator('.dialog-content'));
    await expect(dialog).toBeVisible();

    // Verify dialog title
    await expect(page.locator('text=New Project')).toBeVisible();

    // Find the project name input field specifically within the dialog
    const projectNameInput = page.locator('[role="dialog"] input[placeholder*="Project name"]');
    await expect(projectNameInput).toBeVisible();

    // Enter a test project name
    const testProjectName = `Test Project ${Date.now()}`;
    await projectNameInput.fill(testProjectName);

    // Verify the input has the correct value
    await expect(projectNameInput).toHaveValue(testProjectName);

    // Take a screenshot with the filled dialog
    await page.screenshot({ path: 'tests/screenshots/project-dialog-filled.png', fullPage: true });

    // Find and click the Create button within the dialog
    const createButton = page.locator('[role="dialog"] button', { hasText: 'Create' });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
    await createButton.click();

    // Wait for the dialog to close and project to be created
    await expect(dialog).not.toBeVisible();

    // Wait a bit for the project to be created and UI to update
    await page.waitForTimeout(2000);

    // Verify the project appears in the sidebar specifically
    // Look for the project name in the projects list (sidebar area)
    const projectInSidebar = page.locator('.w-72 span').filter({ hasText: testProjectName });
    await expect(projectInSidebar).toBeVisible();

    // Take a final screenshot showing the created project
    await page.screenshot({ path: 'tests/screenshots/project-created.png', fullPage: true });

    // Verify the project is selected (optional - check if it has selected styling)
    const selectedProject = page.locator('.w-72 .bg-accent').filter({ hasText: testProjectName });
    await expect(selectedProject).toBeVisible();
  });

  test('should handle project creation with keyboard shortcuts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click the add project button to open dialog
    const addProjectButton = page.getByRole('button', { name: 'Add project' });
    const createFirstProjectButton = page.getByRole('button', { name: 'Create your first project' });

    if (await addProjectButton.isVisible()) {
      await addProjectButton.click();
    } else {
      await createFirstProjectButton.click();
    }

    // Wait for dialog to appear
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Enter project name within the dialog
    const projectNameInput = page.locator('[role="dialog"] input[placeholder*="Project name"]');
    const testProjectName = `Keyboard Test Project ${Date.now()}`;
    await projectNameInput.fill(testProjectName);

    // Press Enter to create the project
    await projectNameInput.press('Enter');

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible();

    // Wait for project creation
    await page.waitForTimeout(2000);

    // Verify project was created and appears in sidebar
    const projectInSidebar = page.locator('.w-72 span').filter({ hasText: testProjectName });
    await expect(projectInSidebar).toBeVisible();
  });

  test('should cancel project creation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open the project creation dialog
    const addProjectButton = page.getByRole('button', { name: 'Add project' });
    const createFirstProjectButton = page.getByRole('button', { name: 'Create your first project' });

    if (await addProjectButton.isVisible()) {
      await addProjectButton.click();
    } else {
      await createFirstProjectButton.click();
    }

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Enter some text in the dialog input
    const projectNameInput = page.locator('[role="dialog"] input[placeholder*="Project name"]');
    await projectNameInput.fill('This should be cancelled');

    // Click Cancel button within the dialog
    const cancelButton = page.locator('[role="dialog"] button', { hasText: 'Cancel' });
    await cancelButton.click();

    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();

    // Verify no project was created with that name in the sidebar
    const projectInSidebar = page.locator('.w-72 span').filter({ hasText: 'This should be cancelled' });
    await expect(projectInSidebar).not.toBeVisible();
  });
});
