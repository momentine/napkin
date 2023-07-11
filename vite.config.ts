import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import buildElectron from '@bin-tools/build-electron'
// import buildElectron from './src/plugins/build-electron'


const vueOutDir = "./release/bundle";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), buildElectron()],
  base: './',
  build: {
    outDir: vueOutDir,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
          moment: ['moment']
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src'),
      "@app": path.resolve(__dirname, 'src/app'),
      "@pages": path.resolve(__dirname, 'src/app/pages'),
      "@common": path.resolve(__dirname, 'src/common'),
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true;@import (reference) "${path.resolve('src/app/index.less')}";`
        },
        javascriptEnabled: true,
      }
    }
  },
  // @ts-ignore Electron packaging configuration
  electron: {
    // Entry file for packaging
    entry: path.join(process.cwd(), 'src/main/index.ts'),
    // Output file path using Vite configuration build.outDir
    // Output file name
    outPut: 'entry.js',
    // Electron-builder configuration, see https://github.com/electron-userland/electron-builder for reference
    builderOptions: {
      config: {
        directories: {
          output: './release/release',
          app: vueOutDir
        },
        files: ['**'],
        productName: "便签", // Product name
        appId: "com.bianqian.binbin",
        asar: true,
        extraResources: './resource/release',
        win: {
          target: ['zip', 'nsis'],
          icon: "./public/logo.ico"
        },
        mac: {
          icon: "./public/logo.ico",
          category: "public.app-category-productivity",
          artifactName: "${productName}_${version}.${ext}", // Application package name
          target: ["dmg", "zip"]
        }
      },
      projectDir: process.cwd(),
    },
    // Copy static resources
    staticDir: [{
      // Source folder path
      src: "src/static",
      // Destination folder path
      dest: vueOutDir.substring(2, vueOutDir.length) + '/static',
    }]
  }
})
