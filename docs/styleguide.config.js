const path = require('path')
const fs = require('fs')
const tsDocgen = require('react-docgen-typescript')

module.exports = {
  ribbon: {
    url: 'https://github.com/owanturist/react-hook-window',
    text: 'Fork me on GitHub'
  },

  title: 'React Hook Window',
  usageMode: 'hide',
  pagePerSection: true,

  sections: [
    {
      name: 'Getting Started',
      content: 'sections/getting-started.md'
    },
    {
      name: 'Hooks',
      sectionDepth: 2,
      components: [
        '../lib/src/use-windowed-list.ts',
        '../lib/src/use-infinite-loader.ts'
      ]
    }
  ],

  updateExample(props, exampleFilePath) {
    const settings = props.settings || {}

    if (typeof settings.example === 'string') {
      try {
        const { example, ...restSettings } = settings

        const filepath = path.resolve(
          path.dirname(exampleFilePath),
          path.basename(exampleFilePath, '.md'),
          `${example}.example.tsx`
        )

        return {
          content: fs.readFileSync(filepath, 'utf8'),
          settings: restSettings,
          lang: 'tsx'
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`\nStyleguidist.updateExample failed:\n%s`, error.message)

        return props
      }
    }

    return props
  },

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
