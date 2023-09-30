import path from 'path'
import type { Configuration } from 'webpack'

import { rules } from './webpack.rules'

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    alias: {
      '@ecs': path.resolve(__dirname, 'src/ecs'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
      '@scripts': path.resolve(__dirname, 'src/scripts'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@ui': path.resolve(__dirname, 'src/ui'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
}
