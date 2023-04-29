const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  runtimeCompiler: true,
  css: {
    extract: true,
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser'
      })
    ],
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm-bundler.js',
        '@': __dirname + '/resources/js'
      },
      fallback: {
        "fs": false,
        "path": false,
        "os": false,
        "path": require.resolve("path-browserify")
      }
    }
  }
})
