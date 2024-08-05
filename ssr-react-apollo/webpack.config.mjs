import  path from 'path'
import webpack from 'webpack'
import 'webpack-dev-server'
import dotenv from 'dotenv'
import nodeExternals from 'webpack-node-externals'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import TerserPlugin from 'terser-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
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

// Client-side configuration
const clientConfig = {
  mode: 'production',
  target: 'web',
  entry: './src/client/entry.tsx',
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
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin(getEnvironmentVariables()),
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
  entry: './src/server/entry.tsx', // Entry point for the server app
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
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
}

export default [clientConfig, serverConfig]
