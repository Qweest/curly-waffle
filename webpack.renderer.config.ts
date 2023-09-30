import path from 'path'
import type { Configuration } from 'webpack'

import { plugins } from './webpack.plugins'
import { rules } from './webpack.rules'

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
})

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      '@ecs': path.resolve(__dirname, 'src/ecs'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
      '@scripts': path.resolve(__dirname, 'src/scripts'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@ui': path.resolve(__dirname, 'src/ui'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
}
