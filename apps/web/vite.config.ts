import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const certificateDirectory = join(homedir(), '.aspnet', 'https')
  const certificatePath = env.DEV_HTTPS_CERT
    || join(certificateDirectory, 'improvedtodo.pem')
  const certificateKeyPath = env.DEV_HTTPS_KEY
    || join(certificateDirectory, 'improvedtodo.key')

  return {
    // TLS here is only for Vite's local development server. Production TLS is
    // terminated by the hosting platform serving the built `dist` directory.
    server: command === 'serve'
      ? {
          https: {
            cert: readFileSync(certificatePath),
            key: readFileSync(certificateKeyPath),
          },
          port: 5173,
        }
      : undefined,
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
    ],
  }
})
