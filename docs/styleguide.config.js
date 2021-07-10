const path = require('path')
const tsDocgen = require('react-docgen-typescript')

module.exports = {
  title: 'React Hook Window',
  pagePerSection: true,

  sections: [
    {
      name: 'Getting Started',
      content: 'sections/getting-started.md'
    },
    {
      name: 'Hooks',
      exampleMode: 'expand',
      usageMode: 'expand',
      sections: [
        {
          name: 'useWindowedList',
          description: 'Description for useWindowedList',
          content: 'sections/hooks/use-windowed-list.md'
        },
        {
          name: 'useInfiniteLoader',
          description: 'Description for useInfiniteLoader',
          content: 'sections/hooks/use-infinite-loader.md'
        }
      ]
    }
  ],

  propsParser(filePath, source, resolver, handlers) {
    return tsDocgen.parse(filePath, source, resolver, handlers)
  },

  webpackConfig: {
    resolve: {
      alias: {
        '~': path.join(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.module\.css$/i,
          use: ['style-loader', 'css-loader']
        }
      ]
    }
  }
}
