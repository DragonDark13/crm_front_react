import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({

    logLevel: "info",
    plugins: [react()],
    base: '/crm_front_react/',
    build: {
        outDir: 'build',
        reportCompressedSize: true,
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
                        return 'react-vendor';
                    }

                    if (/node_modules\/(\@mui|\@emotion)\//.test(id)) {
                        return 'mui-vendor';
                    }

                    if (/node_modules\/(recharts|d3-[^/]+|victory-vendor)\//.test(id)) {
                        return 'charts-vendor';
                    }

                    if (/node_modules\/(chart\.js|react-chartjs-2)\//.test(id)) {
                        return 'chartjs-vendor';
                    }
                },
            },
        },
    }
})
