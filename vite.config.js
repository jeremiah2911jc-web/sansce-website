import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { contactPreviewPlugin } from './scripts/contact-preview-plugin.mjs';
export default defineConfig({plugins: [react(), contactPreviewPlugin()]});
