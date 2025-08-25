// Utility functions for managing splash screen state

export const resetSplashState = () => {
  localStorage.removeItem('hasVisited');
  localStorage.removeItem('preferredLanguage');
  console.log('Splash state reset - will show full splash flow on next visit');
};

export const skipSplashScreen = () => {
  localStorage.setItem('hasVisited', 'true');
  localStorage.setItem('preferredLanguage', 'en');
  console.log('Splash screen skipped - will go directly to app on next visit');
};

export const enableSplashScreen = () => {
  localStorage.removeItem('hasVisited');
  console.log('Splash screen enabled - will show on next visit');
};

// Development helper - call this in browser console to skip splash
if (typeof window !== 'undefined') {
  (window as any).skipSplash = skipSplashScreen;
  (window as any).resetSplash = resetSplashState;
  (window as any).enableSplash = enableSplashScreen;
}