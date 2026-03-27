/**
 * Chanomhub SDK - React Native Entry Point
 *
 * This entry point provides React Native specific functionality that requires
 * native dependencies like react-native-app-auth.
 *
 * @example
 * ```typescript
 * import { createChanomhubClient } from '@chanomhub/sdk';
 * import { createNativeAuthRepository } from '@chanomhub/sdk/native';
 *
 * const sdk = createChanomhubClient();
 * const nativeAuth = createNativeAuthRepository(sdk.rest, sdk.config);
 *
 * // Sign in with Google on React Native
 * const result = await nativeAuth.signInWithGoogleNative({
 *   googleClientId: 'your-google-client-id',
 *   redirectUri: 'com.yourapp:/oauth2redirect',
 * });
 * ```
 */

export {
    createNativeAuthRepository,
    type NativeAuthRepository,
} from './repositories/authRepository.native';

// Re-export types used by native auth
export type {
    NativeOAuthConfig,
    NativeOAuthOptions,
    NativeOAuthResult,
    OAuthProvider,
    LoginResponse,
} from './types/auth';
