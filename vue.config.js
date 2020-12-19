const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production'
const logoIco = "public/logo.ico"

function resolve (dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  lintOnSave: false,
  runtimeCompiler:true,
  publicPath: isDevelopment ? "./" : "/",
  outputDir: "dist/web",
  productionSourceMap: false,
  parallel: require("os").cpus().length > 1,
  devServer: {
    // open: !process.argv.includes("electron:serve"),
    // can be overwritten by process.env.HOST
    host: '0.0.0.0',  
    port: 8080
  },
  chainWebpack: config => {
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        bypassOnDebug: true
      })
      .end();

    config.resolve.alias.set('@', resolve('src/renderer'))
  },
  configureWebpack: {
    devtool: 'source-map',
    entry: "./src/renderer/main.js",
    resolve: {
      extensions: [".js", ".vue", ".json", ".ts"],
      alias: {
        "@": resolve("src/renderer")
      }
    },
    module: {
      rules: [
        {
          test: /\.(html)(\?.*)?$/,
          use: "vue-html-loader"
        },
        {
          test: /.md$/,
          loader: "text-loader"
        }
      ]
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: "all",
            test: /node_modules/,
            name: "vendor",
            minChunks: 1,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 100
          },
          common: {
            chunks: "all",
            test: /[\\/]src[\\/]js[\\/]/,
            name: "common",
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 60
          },
          styles: {
            name: "styles",
            test: /\.(sa|sc|c)ss$/,
            chunks: "all",
            enforce: true
          },
          runtimeChunk: {
            name: "manifest"
          }
        }
      }
    },
    performance: {
      hints: "warning",
      maxEntrypointSize: 50000000,
      maxAssetSize: 30000000,
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith(".js");
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        files: ["**/*"],
        asar: true,
        productName:  'EDownloads',
        electronDownload: {
          "mirror": "https://npm.taobao.org/mirrors/electron/"
        },
        extraResources: [
          "extend/*"
        ],
        win: {
          icon: logoIco,
          artifactName: "${productName}_Setup_${version}.${ext}",
          target: [
            {
              target: "nsis",
              arch: ["ia32"]
            }
          ]
        },
        nsis: {
          oneClick: false,
          allowElevation: true,
          allowToChangeInstallationDirectory: true,
          installerIcon: logoIco,
          uninstallerIcon: logoIco,
          installerHeaderIcon: logoIco,
          createDesktopShortcut: true,
          createStartMenuShortcut: true
        }
      },
      outputDir: "dist/electron",
      mainProcessFile: "src/main/app.js",
      mainProcessWatch: ["src/main"],
      chainWebpackMainProcess: config => {
        config.resolve.alias.set('@', resolve("src/main"))
      },
      chainWebpackRendererProcess: config => {
        config.resolve.alias.set('@', resolve("src/renderer"))
      }
    }
  }
};