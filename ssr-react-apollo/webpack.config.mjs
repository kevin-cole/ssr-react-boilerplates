import  path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import 'webpack-dev-server'
import dotenv from 'dotenv'
import nodeExternals from 'webpack-node-externals'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import TerserPlugin from 'terser-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load .env into process.env
dotenv.config()
const getEnvironmentVariables = () => {
  const env = {}
  Object.keys(process.env).forEach((key) => {
      if (key.startsWith('PUBLIC_')) {
          // DefinePlugin expects values to be in double quotes when replacing
          env[`process.env.${key}`] = JSON.stringify(process.env[key])
      }
  })
  return env
}

const getStyleFiles = async (dir) => {
  const directoryPath = path.resolve(dir)
  const allFiles = await fs.promises.readdir(directoryPath)
  const cssFiles = allFiles
      .filter(file => file.endsWith('.css') && !file.endsWith('.module.css'))
      .map(file => path.join(directoryPath, file))
  return cssFiles
}

// Client-side configuration
const clientConfig = {
  mode: 'production',
  target: 'web',
  entry: async () => {
    const styleFiles = await getStyleFiles('./src/global-styles')
    return ['./src/client/entry.tsx', ...styleFiles]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript']
            }
          },
          {
            loader: 'ts-loader',
          }
        ]
      },
      {
        test: /\.module\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]__[local]___[hash:base64:5]',
                exportLocalsConvention: (name) => {
                  return name.replace(/-/g, '_');
                },
              },
              importLoaders: 1,
              sourceMap: true, // Enable source maps if needed
            }
          },
        ]
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  optimization: {
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // Enables HMR
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new webpack.DefinePlugin(getEnvironmentVariables()),
    new CopyPlugin({
      patterns: [
          { from: 'src/assets', to: 'assets' } // Copies all contents of src/assets to dist/assets
      ]
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true, // Enable hot module replacement
    port: process.env.PORT,
    proxy: [
      {
        context: ['/api'],
        target: `${process.env.EXPRESS_SERVER}`,
        pathRewrite: {'^/api' : ''}
      }
    ]
  }
}

if (process.env.ANALYZE) {
  clientConfig.plugins = (clientConfig.plugins || []).concat([
      new BundleAnalyzerPlugin()
  ])
}

// Server-side configuration
const serverConfig = {
  mode: 'production',
  entry: './src/server/entry.tsx',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript']
            }
          },
          {
            loader: 'ts-loader',
          }
        ]
      },
      {
        test: /\.module\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]__[local]___[hash:base64:5]',
                exportLocalsConvention: (name) => {
                  return name.replace(/-/g, '_');
                },
              },
              importLoaders: 1,
              sourceMap: true, // Enable source maps if needed
            }
          }
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
}

export default [clientConfig, serverConfig]
