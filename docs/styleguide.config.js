const path = require('path')
const tsDocgen = require('react-docgen-typescript')

module.exports = {
  ribbon: {
    url: 'https://github.com/owanturist/react-hook-window',
    text: 'Fork me on GitHub'
  },

  title: 'React Hook Window',
  usageMode: 'expand',
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
      sectionDepth: 2,
      components: [
        '../lib/src/use-windowed-list.ts',
        '../lib/src/use-infinite-loader.ts'
      ]
    }
  ],

  getComponentPathLine: componentPath => {
    const { name } = path.parse(componentPath)
    const camelCaseName = name.replace(/-\w/g, ([, second]) =>
      second.toUpperCase()
    )

    return `import { ${camelCaseName} } from 'react-hook-window'`
  },

  getExampleFilename(componentPath) {
    const { name } = path.parse(componentPath)

    return path.join(__dirname, `./sections/hooks/${name}.md`)
  },

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
