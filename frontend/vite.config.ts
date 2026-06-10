import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    // Prevent esbuild from inlining @angular/core state into a separate
    // @angular_platform-browser.js bundle. Without this, setCurrentInjector()
    // in platform-browser lives in a different closure than the one ɵɵinject()
    // reads in @angular/core, causing NG0203 on bootstrap with pnpm + Angular 22.
    exclude: ['@angular/platform-browser', '@angular/animations', '@angular/platform-browser/animations/async'],
  },
});
