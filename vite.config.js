import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

const UNKNOWN_BUILD_COMMIT = 'unknown-build-commit'

function normalizeCommit(value) {
  const commit = String(value || '').trim()
  return /^[0-9a-f]{7,40}$/i.test(commit) ? commit.toLowerCase() : ''
}

function resolveBuildCommit() {
  const vercelCommit = normalizeCommit(process.env.VERCEL_GIT_COMMIT_SHA)
  if (vercelCommit) {
    return { commit: vercelCommit, source: 'vercel-env' }
  }

  const explicitCommit = normalizeCommit(process.env.VITE_SANZE_BUILD_COMMIT)
  if (explicitCommit) {
    return { commit: explicitCommit, source: 'build-env' }
  }

  try {
    const localCommit = normalizeCommit(execSync('git rev-parse HEAD', { encoding: 'utf8' }))
    if (localCommit) {
      return { commit: localCommit, source: 'local-git' }
    }
  } catch {
    // Vercel and local builds may not always have git available.
  }

  return { commit: UNKNOWN_BUILD_COMMIT, source: 'fallback-unknown' }
}

const buildMetadata = resolveBuildCommit()

export default defineConfig({
  plugins: [react()],
  define: {
    __SANZE_BUILD_COMMIT__: JSON.stringify(buildMetadata.commit),
    __SANZE_BUILD_COMMIT_SOURCE__: JSON.stringify(buildMetadata.source),
  },
})
