
# Chanomhub SDK 🚀

**A fully-typed, framework-agnostic TypeScript SDK for interacting with the Chanomhub API**

[![npm version](https://img.shields.io/npm/v/@chanomhub/sdk?style=flat-square)](https://www.npmjs.com/package/@chanomhub/sdk)
[![TypeScript](https://img.shields.io/badge/types-TypeScript-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-v20.9.0+-green.svg?style=flat-square)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![CI Status](https://img.shields.io/github/actions/workflow/status/Chanomhub/chanomhub-sdk/ci.yml?branch=main&style=flat-square)](https://github.com/Chanomhub/chanomhub-sdk/actions)



---

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Build Tool:** TypeScript Compiler
- **Testing:** Vitest
- **Mocking:** MSW (Mock Service Worker)
- **Linter:** ESLint with Prettier
- **Peer Dependency:** Next.js (optional, for Next.js-specific features)

---

## 📦 Installation

### Prerequisites

- Node.js **v20.9.0+**
- npm, yarn, or pnpm

### Quick Start

```bash
npm install @chanomhub/sdk
# or
yarn add @chanomhub/sdk
# or
pnpm add @chanomhub/sdk
```

### Next.js Integration

If you're using Next.js, install the peer dependency:

```bash
npm install next@latest
# or
yarn add next@latest
# or
pnpm add next@latest
```

---

## 🎯 Usage

### Basic Usage

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

// Create a public client
const sdk = createChanomhubClient();

// Fetch articles by tag
const articles = await sdk.articles.getByTag('renpy');
console.log(articles);

// Fetch a single article by slug
const article = await sdk.articles.getBySlug('my-article');
console.log(article);
```

### With Authentication

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

// Create a client with JWT token
const sdk = createChanomhubClient({
  token: 'your-jwt-token',
});

// Now you can access authenticated endpoints
const myArticles = await sdk.articles.getByUser('my-username');
```

### Custom Configuration

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

// Custom API and CDN URLs
const sdk = createChanomhubClient({
  apiUrl: 'https://api.chanomhub.com',
  cdnUrl: 'https://cdn.chanomhub.com',
  token: 'your-jwt-token',
  defaultCacheSeconds: 300, // 5 minutes cache
});
```

### Safely Handling Images (CDN Fallback)

The SDK provides a `getFallbackUrl` utility to handle cases where the CDN image fails to load. This allows your application to gracefully degrade to the original storage URL.

```typescript
import { getFallbackUrl } from '@chanomhub/sdk';

// In your image component (e.g., React/Next.js)
<img
  src={article.mainImage}
  onError={(e) => {
    // Falls back to direct storage URL (e.g., skips cdn-cgi optimization)
    // You can pass specific config.storageUrl if configured, otherwise it defaults to stripped CDN path
    const fallback = getFallbackUrl(e.currentTarget.src, config.cdnUrl);
    
    if (fallback && fallback !== e.currentTarget.src) {
       e.currentTarget.src = fallback;
    }
  }}
/>
```

### Next.js Server Components

For Next.js Server Components, use the special helper:

```typescript
// app/page.tsx
import { createServerClient } from '@chanomhub/sdk/next';

export default async function Page() {
  const sdk = await createServerClient(); // Automatically reads token from cookies
  const articles = await sdk.articles.getAll();

  return (
    <div>
      {articles.map(article => (
        <h2 key={article.id}>{article.title}</h2>
      ))}
    </div>
  );
}
```

### OAuth Authentication (Supabase)

The SDK supports OAuth authentication via Supabase. First, install the Supabase client:

```bash
npm install @supabase/supabase-js
```

Configure the SDK with your Supabase credentials:

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

const sdk = createChanomhubClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Check if OAuth is available
if (sdk.auth.isOAuthEnabled()) {
  // Start Google sign-in (redirects to Google)
  await sdk.auth.signInWithGoogle({
    redirectTo: 'http://localhost:3000/login/callback',
  });
}
```

Handle the OAuth callback:

```typescript
// app/login/callback/page.tsx
import { createChanomhubClient } from '@chanomhub/sdk';
import Cookies from 'js-cookie';

export default async function CallbackPage() {
  const sdk = createChanomhubClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  // Exchange Supabase token for backend JWT
  const result = await sdk.auth.handleCallback();

  if (result) {
    // Store tokens (you manage storage)
    Cookies.set('token', result.token, { secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', result.refreshToken);
    // Redirect to home or dashboard
  }
}
```

Available OAuth methods:

```typescript
// Sign in with specific provider
await sdk.auth.signInWithProvider('google');
await sdk.auth.signInWithProvider('discord');
await sdk.auth.signInWithProvider('github');

// Refresh backend token
const newTokens = await sdk.auth.refreshToken(refreshToken);

// Sign out (clears Supabase session)
await sdk.auth.signOut();

// Get current Supabase session
const session = await sdk.auth.getSupabaseSession();
```

### OAuth for React Native (Pure RN / Without Expo)

For React Native apps, install `react-native-app-auth`:

```bash
npm install @chanomhub/sdk react-native-app-auth
```

Configure and use native OAuth:

```typescript
import { createChanomhubClient } from '@chanomhub/sdk';

const sdk = createChanomhubClient();

// Google Sign-In for React Native
const result = await sdk.auth.signInWithGoogleNative({
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  googleIosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Optional
  redirectUri: 'com.yourapp://oauth',
});

if (result) {
  // result contains: { user, token, refreshToken }
  console.log('Logged in as:', result.user.username);
}
```

Other providers:

```typescript
// Discord
await sdk.auth.signInWithProviderNative('discord', {
  discordClientId: 'YOUR_DISCORD_CLIENT_ID',
  redirectUri: 'com.yourapp://oauth',
});

// GitHub
await sdk.auth.signInWithProviderNative('github', {
  githubClientId: 'YOUR_GITHUB_CLIENT_ID',
  redirectUri: 'com.yourapp://oauth',
});
```

If you handle OAuth flow yourself:

```typescript
import { authorize } from 'react-native-app-auth';

// Use your own OAuth config
const oauthResult = await authorize(myConfig);

// Exchange with backend
const loginResult = await sdk.auth.exchangeOAuthToken(oauthResult);
```

### Electron / Server-side OAuth

For environments where you need to handle the OAuth redirect manually (e.g., Electron, CLI):

```typescript
// 1. Get the OAuth URL
const options = {
  skipBrowserRedirect: true,
  redirectTo: 'myapp://oauth-callback',
  scopes: 'email profile', // Optional
};

const { url } = await sdk.auth.signInWithGoogle(options);
// OR generic provider:
// const { url } = await sdk.auth.signInWithProvider('github', options);

if (url) {
  // 2. Open URL in external browser/window (Electron example)
  // shell.openExternal(url);
}

// 3. In your app's deep link handler, process the returned code/token
// This depends on how you handle deep links in Electron
```

---

## 📁 Project Structure

```
.
├── dist/                  # Compiled TypeScript files
├── src/
│   ├── client.ts          # GraphQL and REST client implementations
│   ├── config.ts          # Configuration types and defaults
│   ├── errors/            # Custom error classes
│   ├── repositories/      # Repository implementations
│   │   ├── articleRepository.ts
│   │   ├── favoritesRepository.ts
│   │   ├── searchRepository.ts
│   │   └── usersRepository.ts
│   ├── transforms/        # Utility functions (e.g., image URL transformation)
│   ├── types/             # TypeScript type definitions
│   │   ├── article.ts
│   │   ├── common.ts
│   │   └── user.ts
│   ├── index.ts           # Main SDK entry point
│   └── next.ts            # Next.js-specific helpers
├── __tests__/             # Test files
├── examples/              # Example usage files
├── .gitignore             # Git ignore rules
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file!
```

---

## 🔧 Configuration

### Environment Variables

The SDK uses configuration through the `createChanomhubClient` function. You can override the following defaults:

```typescript
{
  apiUrl: 'https://api.chanomhub.com',          // Base API URL
  cdnUrl: 'https://cdn.chanomhub.com',          // Base CDN URL for images
  token: 'your-jwt-token',                      // Authentication token
  defaultCacheSeconds: 3600                     // Default cache duration in seconds
}
```

### Field Presets

The SDK provides field presets for article queries to optimize performance:

```typescript
// Available presets
type ArticlePreset = 'minimal' | 'standard' | 'full';

// Example usage with custom fields
const articles = await sdk.articles.getAll({
  limit: 10,
  fields: ['id', 'title', 'slug', 'mainImage'] // Custom field selection
});
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Chanomhub/chanomhub-sdk.git
   cd chanomhub-sdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

### Code Style Guidelines

- Use **TypeScript** for all code
- Follow the **existing code style** (ESLint and Prettier are configured)
- Write **comprehensive tests** for new features
- Keep **commit messages** clear and descriptive

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

**Maintainers:**
- [Your Name](https://github.com/yourusername) - Initial work and ongoing maintenance

**Contributors:**
- [Contributor Name](https://github.com/contributor) - [Contribution Description]
- [Another Contributor](https://github.com/another) - [Contribution Description]

---

## 🐛 Issues & Support

### Reporting Issues

If you encounter a bug or have a feature request, please:
1. Check if it's already reported in the [Issues](https://github.com/Chanomhub/chanomhub-sdk/issues) section
2. If not, open a new issue with:
   - A clear title
   - Detailed description
   - Steps to reproduce (if applicable)
   - Any relevant code snippets

### Getting Help

- **Discussions:** [Chanomhub Community Forum](https://community.chanomhub.com)
- **Chat:** [Chanomhub Discord](https://discord.chanomhub.com)

---

## 🗺️ Roadmap

### Planned Features

- [ ] Add support for WebSockets
- [ ] Implement batch requests
- [ ] Add more detailed analytics
- [ ] Improve TypeScript type coverage
- [ ] Add React hooks for client-side usage

### Known Issues

- [Issue #123](https://github.com/Chanomhub/chanomhub-sdk/issues/123) - Cache invalidation in authenticated sessions
- [Issue #456](https://github.com/Chanomhub/chanomhub-sdk/issues/456) - Edge case handling for large responses

---

## 🎉 Get Started Today!

The Chanomhub SDK is ready to help you build amazing applications with ease. Whether you're creating a content platform, a game development tool, or any other Chanomhub-powered application, this SDK provides the tools you need to succeed.

👉 **[Install Now](https://www.npmjs.com/package/@chanomhub/sdk)** and start building!

---

### 📢 Star and Follow

If you find this SDK useful, please consider **starring** the repository to show your support. Your star helps us track the project's popularity and motivates us to continue improving it.

🌟 **[Star on GitHub](https://github.com/Chanomhub/chanomhub-sdk)**
