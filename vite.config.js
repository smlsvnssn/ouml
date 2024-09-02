import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom',
        coverage: {
            exclude: [
                '**/old/**',
                '**/experiments/**',
                '**/*_bak.*',
                ...coverageConfigDefaults.exclude,
            ],
        },
    },
})
