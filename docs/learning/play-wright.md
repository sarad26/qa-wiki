# Playwright with TypeScript: Learning Guide

A practical, beginner-to-job-ready guide to end-to-end test automation with Playwright and TypeScript. Follow the sections in order, run every example, and finish with the practice tasks at the end.

**Who is this for:** QA engineers, automation testers, SDETs and developers who want modern, reliable web test automation.

## Table of contents

1. [What is Playwright](#what-is-playwright)
2. [Playwright vs Cypress vs Selenium](#playwright-vs-cypress-vs-selenium)
3. [Learning roadmap](#learning-roadmap)
4. [Local setup](#local-setup)
5. [Core concepts: Browser, Context and Page](#core-concepts-browser-context-and-page)
6. [Locators](#locators)
7. [Actions and input methods](#actions-and-input-methods)
8. [Assertions](#assertions)
9. [Waits](#waits)
10. [Frames, tabs, dialogs, uploads and downloads](#frames-tabs-dialogs-uploads-and-downloads)
11. [Hooks, fixtures and Page Object Model](#hooks-fixtures-and-page-object-model)
12. [Authentication and storage state](#authentication-and-storage-state)
13. [API testing and network mocking](#api-testing-and-network-mocking)
14. [Configuration and environments](#configuration-and-environments)
15. [Running tests: CLI, UI mode and codegen](#running-tests-cli-ui-mode-and-codegen)
16. [Reporting and debugging](#reporting-and-debugging)
17. [Visual regression testing](#visual-regression-testing)
18. [Interview questions](#interview-questions)
19. [Best practices](#best-practices)
20. [Practice tasks](#practice-tasks)
21. [Resources](#resources)

---

## What is Playwright {#What is Playwright}

Playwright is an open-source end-to-end automation framework from Microsoft. One API drives **Chromium, Firefox and WebKit** (Safari's engine), in headed (visible) or headless mode, on Windows, macOS and Linux. It can also emulate mobile devices.

### Advantages

| Area | What you get |
| --- | --- |
| Cross-browser | Chrome, Edge, Chromium, Firefox, WebKit |
| Cross-platform | Windows, macOS, Linux |
| Languages | TypeScript, JavaScript, Python, .NET, Java |
| Mobile web | Device emulation (Chrome for Android, Mobile Safari) |
| Auto-waiting | Waits for elements to be ready before acting |
| Tooling | Codegen, Inspector, Trace Viewer, UI mode |
| Speed | Parallel execution, browser contexts instead of new browsers |
| Reliability | Retrying assertions, far fewer flaky tests |
| State saving | Log in once and reuse the session |
| Multi-origin | Tests can cross domains and tabs freely |

> **Note:** Playwright greatly *reduces* flaky tests, but it cannot make them impossible. Bad locators and shared test data still cause flakiness.

### Limitations

- **Resource heavy:** it runs real browser instances, so many parallel workers need a strong machine.
- **No desktop app automation:** web only (Electron apps are an exception).
- **No Internet Explorer or other legacy browsers.**
- **Smaller community than Selenium**, though it is growing quickly.

### Software you need

| Tool | Purpose |
| --- | --- |
| Node.js (18 or newer) | Runtime |
| VS Code | Editor |
| TypeScript | Language (installed with the project) |
| Git and GitHub or Azure DevOps | Source control and CI |
| Postman | Manual API checks |
| Android Studio | Only if you test mobile apps |

---

## Playwright vs Cypress vs Selenium

| Feature | Playwright | Cypress | Selenium WebDriver |
| --- | --- | --- | --- |
| Setup | Very easy | Simple and fast | Heavier configuration |
| Languages | TypeScript, JavaScript, Python, C#, Java | JavaScript and TypeScript only | Java, Python, JavaScript, C#, Ruby and more |
| Speed | Very fast | Fast (runs inside the browser) | Slower (WebDriver protocol overhead) |
| Browsers | Chromium, Chrome, Edge, Firefox, WebKit | Chrome, Edge, Electron (limited Firefox and Safari) | All major browsers |
| Parallel runs | Built in | Paid cloud or plugins | Needs Grid or similar |
| Debugging | Excellent (Trace Viewer, contexts) | Excellent (time travel, snapshots) | Basic, needs third-party tools |
| Community | Growing fast | Strong in the JS world | Large and mature |

---

## Learning roadmap

**Duration:** 8 to 10 weeks, about 1.5 hours a day.

| Phase | Weeks | Focus | Topics |
| --- | --- | --- | --- |
| 1 | 1 | JavaScript and TypeScript basics | `let`/`const`, functions and arrow functions, async/await and promises, arrays, loops, classes and interfaces |
| 2 | 2 to 3 | Playwright basics | Install, first tests, browsers, locators, navigation, clicks, typing, auto-waiting |
| 3 | 4 to 5 | Test runner and structure | Page Objects, fixtures, tags, hooks, parallel execution, `playwright.config.ts`, trace and video |
| 4 | 6 | Advanced features | iFrames, Shadow DOM, uploads and downloads, dialogs, mobile emulation, accessibility |
| 5 | 7 | API testing | `request` context, CRUD calls, API-driven test data, response assertions |
| 6 | 8 | Reporting and CI/CD | HTML reports, retries, GitHub Actions or Jenkins, headless and Docker runs, notifications |
| 7 | 9 to 10 | Final project | A full E2E suite on a public site, API plus UI tests, push to GitHub, add to your resume |

**Daily plan (1.5 hours)**

| Time | Task |
| --- | --- |
| 30 min | Learn or watch the concept |
| 30 min | Practise with code |
| 30 min | Build a real scenario or improve your framework |

---

## Local setup

1. **Install VS Code** from the official website.
2. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ashley-next
   ```
3. **Check Node.js and npm**
   ```bash
   node --version
   npm --version
   ```
   If missing, install Node.js from nodejs.org.
4. **Install project dependencies**
   ```bash
   npm install
   ```
5. **Install Playwright browsers**
   ```bash
   npx playwright install
   npx playwright --version
   ```
6. **Install Ortoni Report** (HTML reporter)
   ```bash
   npm install ortoni-report --save-dev
   ```
   Global alternative: `npm install -g ortoni-report`
7. **Install the VS Code extension:** open Extensions (`Ctrl+Shift+X`), search **Playwright Test for VSCode**, click Install.

> **Troubleshooting:** if the config file shows an error near `folderPath: './ortoni-report'`, check the reporter block in `playwright.config.ts` (see [Configuration and environments](#configuration-and-environments)).

### Starting a brand new project

```bash
mkdir playwright-ts && cd playwright-ts
npm init playwright@latest
```

Choose TypeScript, a `tests` folder and install the browsers when asked. Run the sample test to confirm everything works:

```bash
npx playwright test
```

### Typical folder layout

```text
project/
├── tests/                  # spec files
├── pages/                  # Page Object classes
├── fixtures/               # custom fixtures
├── test-data/              # JSON, CSV, Excel data
├── playwright.config.ts    # main configuration
└── package.json
```

---

## Core concepts: Browser, Context and Page

| Concept | What it is | Notes |
| --- | --- | --- |
| **Browser** | One browser instance (Chromium, Firefox or WebKit) | Heavy to create, so the test runner starts it once |
| **BrowserContext** | An isolated session inside a browser | Own cookies, storage and permissions. Cheap to create |
| **Page** | A single tab inside a context | One context can hold many pages |

```text
Browser
 ├── Context A (user 1: own cookies and storage)
 │    ├── Page 1
 │    └── Page 2
 └── Context B (user 2: completely separate session)
      └── Page 1
```

The test runner gives every test a fresh context automatically, which is why tests do not leak state into each other.

```ts
import { test, chromium } from '@playwright/test';

test('two isolated users', async () => {
  const browser = await chromium.launch();
  const userA = await browser.newContext();
  const userB = await browser.newContext();

  const pageA = await userA.newPage();
  const pageB = await userB.newPage();

  await pageA.goto('https://example.com');
  await pageB.goto('https://example.com');

  await browser.close();
});
```

---

## Locators

A locator finds an element and **re-queries it every time you use it**, so it never goes stale.

### Priority order (use the first one that works)

| Priority | Locator | Use for |
| --- | --- | --- |
| 1 | `getByRole()` | Buttons, links, headings, checkboxes (accessibility based, preferred) |
| 2 | `getByLabel()` | Form fields that have a label |
| 3 | `getByPlaceholder()` | Inputs with a unique placeholder |
| 4 | `getByText()` | Visible text |
| 5 | `getByTestId()` | Elements with `data-testid` |
| 6 | `locator()` with CSS or XPath | Last resort |

```ts
await page.getByRole('button', { name: 'Login' }).click();
await page.getByLabel('Email Address').fill('user@example.com');
await page.getByPlaceholder('Enter your name').fill('Sara');
await page.getByText('Sign In').click();
await page.getByTestId('login-btn').click();
await page.locator('button.login').click();          // CSS
await page.locator('//div[@id="user"]').click();     // XPath
```

### Working with many matches

```ts
const items = page.locator('li.product');

await items.first().click();
await items.last().click();
await items.nth(2).click();          // zero-based
const total = await items.count();
```

### Filtering and chaining

```ts
await page
  .getByRole('listitem')
  .filter({ hasText: 'Sofa' })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

> **Tip:** use **codegen** (`npx playwright codegen <url>`) to discover locators, then clean them up by hand.

---

## Actions and input methods

| Action | Code | Notes |
| --- | --- | --- |
| Click | `await locator.click()` | Waits until the element is actionable |
| Double click | `await locator.dblclick()` | |
| Fill | `await locator.fill('text')` | Sets the value instantly and replaces existing text. **Use this by default** |
| Type slowly | `await locator.pressSequentially('text', { delay: 100 })` | Types one key at a time. Use for fields with key listeners |
| Press a key | `await locator.press('Enter')` | |
| Clear | `await locator.clear()` | |
| Check or uncheck | `await locator.check()` / `uncheck()` | |
| Select option | `await locator.selectOption('value')` | For `select` elements |
| Hover | `await locator.hover()` | |
| Scroll into view | `await locator.scrollIntoViewIfNeeded()` | |
| Drag and drop | `await source.dragTo(target)` | |

> **Note:** the older `locator.type()` still exists but is deprecated. Prefer `fill()` or `pressSequentially()`.

### Navigation

```ts
await page.goto('https://example.com');
await page.reload();
await page.goBack();
await page.goForward();
await page.waitForURL('**/dashboard');
```

### Element state checks

```ts
const visible = await locator.isVisible();
const enabled = await locator.isEnabled();
const checked = await locator.isChecked();
```

> Prefer `expect(locator).toBeVisible()` over `isVisible()` in tests. The `expect` version retries, the boolean check does not.

---

## Assertions

Playwright assertions **retry automatically** until they pass or time out.

### Hard assertions (stop the test on failure)

| Check | Assertion |
| --- | --- |
| Visible | `toBeVisible()` |
| Hidden | `toBeHidden()` |
| Enabled / Disabled | `toBeEnabled()` / `toBeDisabled()` |
| Editable | `toBeEditable()` |
| Empty | `toBeEmpty()` |
| Checked | `toBeChecked()` |
| Text | `toHaveText()` / `toContainText()` |
| Input value | `toHaveValue()` |
| Count | `toHaveCount()` |
| URL | `toHaveURL()` |
| Title | `toHaveTitle()` |

```ts
import { test, expect } from '@playwright/test';

test('search box basics', async ({ page }) => {
  await page.goto('https://example.com');

  const search = page.getByPlaceholder('Search').first();
  await expect(search).toBeVisible();
  await expect(search).toBeEditable();
  await expect(search).toBeEmpty();

  await search.fill('sofa');
  await expect(search).toHaveValue('sofa');
  await expect(page).toHaveURL(/example/);
});
```

### Soft assertions (collect failures, keep running)

```ts
test('page elements', async ({ page }) => {
  await page.goto('https://example.com');

  await expect.soft(page.getByRole('heading')).toBeVisible();
  await expect.soft(page.getByRole('link', { name: 'More' })).toBeVisible();
  await expect.soft(page).toHaveTitle(/Example/);
  // every failure is reported at the end of the test
});
```

Use soft assertions to validate many independent UI elements in one run.

---

## Waits

| Type | Example | Recommendation |
| --- | --- | --- |
| **Auto-wait** | `await page.click('button')` | Default. Use this first |
| Element state | `await locator.waitFor({ state: 'visible' })` | Good for explicit control |
| URL | `await page.waitForURL('**/dashboard')` | After navigation |
| Load state | `await page.waitForLoadState('networkidle')` | Use sparingly |
| Custom condition | `await page.waitForFunction(() => document.querySelectorAll('.item').length > 5)` | Rare cases |
| Event | `await page.waitForEvent('dialog')` | Popups, downloads |
| Response | `await page.waitForResponse('**/api/cart')` | Wait for a specific API call |
| Fixed time | `await page.waitForTimeout(3000)` | **Avoid.** Slow and flaky |

**What auto-wait checks before an action:** the element is attached to the DOM, visible, stable (not animating), able to receive events (not covered) and enabled.

```ts
// Dynamic content: let the assertion do the waiting
await expect(page.locator('.status')).toHaveText('Complete', { timeout: 10000 });
```

> **Rule:** wait for a *condition*, never for *time*.

---

## Frames, tabs, dialogs, uploads and downloads

### iFrames

```ts
await page.frameLocator('iframe#payment').getByRole('button', { name: 'Pay' }).click();
```

### New tab or popup

```ts
const [newPage] = await Promise.all([
  page.context().waitForEvent('page'),
  page.getByRole('link', { name: 'Open in new tab' }).click(),
]);
await newPage.waitForLoadState();
await expect(newPage).toHaveURL(/terms/);
```

### Multiple tabs

```ts
const tabs = page.context().pages();   // all open pages
await tabs[0].bringToFront();
```

### Alerts, confirms and prompts

Register the handler **before** the action that opens the dialog.

```ts
page.once('dialog', async (dialog) => {
  console.log(dialog.message());
  await dialog.accept();      // or dialog.dismiss()
});
await page.getByRole('button', { name: 'Delete' }).click();
```

### File upload

```ts
await page.locator('input[type="file"]').setInputFiles('files/resume.pdf');
await page.locator('input[type="file"]').setInputFiles(['a.pdf', 'b.pdf']);   // several files
```

### File download

```ts
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('link', { name: 'Export' }).click(),
]);
await download.saveAs('downloads/' + download.suggestedFilename());
```

---

## Hooks, fixtures and Page Object Model

### Hooks

```ts
test.describe('Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.afterEach(async ({ page }) => {
    // cleanup if needed
  });

  test('add item', async ({ page }) => { /* ... */ });
});
```

### Tags

```ts
test('checkout @smoke', async ({ page }) => { /* ... */ });
```
```bash
npx playwright test --grep @smoke
```

### Page Object Model (POM)

Keep locators and actions for one page in one class. Tests then read like plain English.

```ts
// pages/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  private username = () => this.page.getByLabel('Username');
  private password = () => this.page.getByLabel('Password');
  private loginBtn = () => this.page.getByRole('button', { name: 'Login' });

  async goto() {
    await this.page.goto('/login');
  }

  async login(user: string, pass: string) {
    await this.username().fill(user);
    await this.password().fill(pass);
    await this.loginBtn().click();
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/dashboard/);
  }
}
```

### Custom fixtures

A fixture hands a ready-made object to your test, with setup and cleanup built in.

```ts
// fixtures/index.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type MyFixtures = { loginPage: LoginPage };

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
export { expect } from '@playwright/test';
```

```ts
// tests/login.spec.ts
import { test } from '../fixtures';

test('valid login', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'Password123');
  await loginPage.expectLoggedIn();
});
```

---

## Authentication and storage state

Log in **once**, save the session, and reuse it in every test.

**What gets saved:** cookies, localStorage, sessionStorage and IndexedDB.

```ts
// auth.setup.ts
import { test as setup } from '@playwright/test';

setup('log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('qa_user');
  await page.getByLabel('Password').fill(process.env.QA_PASSWORD!);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: '.auth/user.json' });
});
```

```ts
// playwright.config.ts (projects section)
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
    dependencies: ['setup'],
  },
],
```

> **Security:** add `.auth/` to `.gitignore` and read passwords from environment variables, never from source code.

---

## API testing and network mocking

### API testing with the `request` fixture

No browser is needed. Use it to test endpoints or to create test data quickly.

```ts
import { test, expect } from '@playwright/test';

test('create and read a user', async ({ request }) => {
  const created = await request.post('https://reqres.in/api/users', {
    data: { name: 'Sara', job: 'QA' },
  });
  expect(created.status()).toBe(201);

  const list = await request.get('https://reqres.in/api/users?page=1');
  expect(list.ok()).toBeTruthy();
  const body = await list.json();
  expect(body.data.length).toBeGreaterThan(0);
});
```

| Method | Purpose |
| --- | --- |
| `request.get()` | Read data |
| `request.post()` | Create data |
| `request.put()` / `patch()` | Update data |
| `request.delete()` | Remove data |

### Network interception and mocking

```ts
// Mock a response
await page.route('**/api/users', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Mock User' }]),
  }),
);

// Block images to speed up tests
await page.route('**/*.{png,jpg,jpeg}', (route) => route.abort());

// Modify a request and let it continue
await page.route('**/api/**', (route) =>
  route.continue({ headers: { ...route.request().headers(), 'x-test': 'true' } }),
);
```

**Why mock?** Stable data, easy error scenarios (500, timeouts) and no dependency on a real backend.

---

## Configuration and environments

### `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,

  reporter: [
    ['html'],
    ['ortoni-report', { folderPath: 'ortoni-report', filename: 'index.html' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://staging.example.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

### One suite, many environments

```json
{
  "scripts": {
    "test": "playwright test",
    "test:dev": "cross-env BASE_URL=https://dev.example.com playwright test",
    "test:staging": "cross-env BASE_URL=https://staging.example.com playwright test",
    "test:headed": "playwright test --headed --workers=1",
    "test:report": "playwright show-report"
  }
}
```

> **Windows users:** `BASE_URL=... playwright test` does not work in Command Prompt. Install `cross-env` (`npm install -D cross-env`) as shown above.

---

## Running tests: CLI, UI mode and codegen

### Command cheat sheet

| Goal | Command |
| --- | --- |
| Run everything | `npx playwright test` |
| One file | `npx playwright test tests/login.spec.ts` |
| Match by title | `npx playwright test -g "login"` |
| Several patterns | `npx playwright test --grep "login\|signup"` |
| Exclude tests | `npx playwright test --grep-invert "slow"` |
| One browser | `npx playwright test --project=chromium` |
| Visible browser | `npx playwright test --headed` |
| Step-through debug | `npx playwright test --debug` |
| Interactive UI | `npx playwright test --ui` |
| Parallel workers | `npx playwright test --workers=4` |
| Retry failures | `npx playwright test --retries=2` |
| Only last failures | `npx playwright test --last-failed` |
| List tests | `npx playwright test --list` |
| HTML report | `npx playwright test --reporter=html` |
| Open last report | `npx playwright show-report` |
| Open a trace | `npx playwright show-trace trace.zip` |
| Record a test | `npx playwright codegen <url>` |
| Install browsers | `npx playwright install` |
| Browsers and OS packages | `npx playwright install --with-deps` |

### UI mode

`npx playwright test --ui` opens a graphical runner.

**Use it for:** debugging failures, learning Playwright, writing new tests, finding locators and understanding page behaviour. It shows a timeline, DOM snapshots, network calls and console logs for every step.

**Not for:** CI/CD pipelines, large automated runs, performance testing or production environments. Use headless CLI runs there.

**Watch mode:** in UI mode, click the eye icon beside a project, spec file or single test. The test re-runs every time you save the file. You can watch at three levels: project, spec file and test.

### Codegen

```bash
npx playwright codegen https://example.com
npx playwright codegen --browser=firefox https://example.com
npx playwright codegen --viewport-size=1280,720 https://example.com
npx playwright codegen --device="iPhone 13" https://example.com
```

Codegen records your clicks and typing and writes the test code with sensible locators. Treat the output as a draft and tidy it up.

---

## Reporting and debugging

| Tool | What it gives you |
| --- | --- |
| **HTML report** | Interactive pass/fail summary |
| **Trace Viewer** | Step-by-step replay with DOM, network and console |
| **Screenshots** | Automatic on failure |
| **Video** | Full recording of a run |
| **Ortoni Report** | Rich HTML dashboard (used in this project) |

### Debugging checklist

1. Run headed: `npx playwright test --headed`
2. Step through: `npx playwright test --debug` (opens the Inspector)
3. Pause inside a test with `await page.pause();`
4. Slow it down in the config: `use: { launchOptions: { slowMo: 500 } }`
5. Open the trace of the failed run: `npx playwright show-trace`
6. Print values with `console.log()` while investigating

---

## Visual regression testing

Compare the current screen against a saved baseline image.

```ts
test('homepage looks the same', async ({ page }) => {
  await page.goto('https://example.com');

  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100,
    mask: [page.locator('.timestamp')],   // ignore dynamic areas
    fullPage: true,
  });
});
```

- The first run creates the baseline. Later runs compare against it.
- Update baselines on purpose with `npx playwright test --update-snapshots`.
- Mask clocks, ads and anything that changes on every load.
- Generate baselines on the same OS and browser as CI, or they will differ.

---

## Interview questions

**1. What is Playwright and how is it different from Selenium?**
A modern Microsoft E2E framework with one API for Chromium, Firefox and WebKit. It auto-waits, talks to browsers directly instead of through WebDriver, runs faster and ships with tracing, video and a test runner.

**2. What is a BrowserContext?**
An isolated browser session with its own cookies, storage and permissions. Each test gets a fresh one, which gives parallel tests full isolation.

**3. Difference between Page and Context?**
A Page is one tab. A Context is the session that can hold many tabs.

**4. How does auto-waiting work?**
Before each action Playwright checks that the element is attached, visible, stable, enabled and not covered. This removes most manual waits.

**5. Which locator should you prefer?**
`getByRole`, then label, placeholder, text and test id. CSS and XPath only as a last resort.

**6. Hard vs soft assertions?**
Hard assertions stop the test at the first failure. Soft assertions (`expect.soft`) record the failure and continue, reporting everything at the end.

**7. How do you handle iframes?**
`page.frameLocator('iframe#id').getByRole(...)`.

**8. How do you avoid logging in for every test?**
Save `storageState` once in a setup project and reuse it.

**9. How do you mock an API?**
`page.route()` with `route.fulfill()`, `route.abort()` or `route.continue()`.

**10. How do you run tests in parallel safely?**
Keep tests independent, use `fullyParallel`, give each test its own data and avoid shared state.

**11. How do you debug a failing test?**
Headed mode, `--debug`, `page.pause()`, UI mode and the Trace Viewer.

**12. What are fixtures?**
Reusable setup objects injected into tests, with built-in teardown. They replace large `beforeEach` blocks.

**13. How do you do visual testing?**
`toHaveScreenshot()` against baselines, with masks for dynamic content.

**14. How do you test an API and a UI together?**
Use the `request` fixture to create data, then verify it in the UI, or the reverse.

**15. How do you run the same suite on dev, staging and prod?**
Read `baseURL` from an environment variable and expose one npm script per environment.

---

## Best practices

- Prefer role and label locators. Ask your developers for `data-testid` where needed.
- Never use fixed sleeps. Wait for conditions.
- Keep each test independent and able to run alone.
- Create test data through the API, not the UI, to save time.
- Use Page Objects for repeated flows, but keep them thin.
- Keep secrets in environment variables.
- Turn on `trace: 'on-first-retry'` in CI so every failure can be replayed.
- One assertion goal per test. Name tests after the behaviour they prove.
- Tag tests (`@smoke`, `@regression`) so you can run subsets.
- Review flaky tests weekly and fix the cause instead of adding retries.

### Common mistakes

| Mistake | Better approach |
| --- | --- |
| `waitForTimeout(5000)` everywhere | Assert on the condition you expect |
| Long XPath chains | `getByRole` plus `filter()` |
| Using `isVisible()` as an assertion | `await expect(locator).toBeVisible()` |
| Tests that depend on each other | Independent tests with their own data |
| Missing `await` | Enable the `no-floating-promises` lint rule |
| Committing passwords or `auth.json` | Environment variables and `.gitignore` |

---

## Practice tasks

Work through these in order on a public demo site such as saucedemo.com or the Playwright demo apps.

1. **Hello test:** open the site and assert the page title.
2. **Login test:** fill the form, assert the landing URL, then test an invalid login.
3. **Locator drill:** find the same button with role, text and CSS locators. Which is most stable?
4. **Waits:** test a page with delayed content using only retrying assertions.
5. **POM refactor:** move the login steps into a `LoginPage` class.
6. **Fixture:** create a fixture that returns a logged-in page.
7. **Storage state:** log in once in a setup project and reuse the session.
8. **API plus UI:** create data through the `request` fixture and verify it on screen.
9. **Mock:** return a fake 500 response and assert the error message shown.
10. **Report and CI:** produce an HTML report and run the suite in GitHub Actions.

---

## Resources

- Playwright documentation: https://playwright.dev/docs
- TypeScript documentation: https://www.typescriptlang.org/docs/
- Learn JavaScript (freeCodeCamp): https://www.freecodecamp.org/learn/

### Project resources (add your team links)

| Item | Link |
| --- | --- |
| Epic 1357567: Existing BDD migration to Playwright | https://dev.azure.com/ashleyfurniture/Digital%20Experience/_workitems/edit/1357567 |
| Playwright code repo (ashley-next) | https://dev.azure.com/ashleyfurniture/Digital%20Experience/_git/ashley-next |
| Playwright installation and setup doc | *(add link)* |
| Automation Migration (Loop) | *(add link)* |
| Playwright Automation Backlog | *(add link)* |
| Test scenarios workbook (TestConsolidation.xlsx) | *(add link)* |
| Automation Migration Phase 1 demo recording | *(add link)* |