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
      pagePerSection: true,
      sectionDepth: 1,
      sections: [
        {
          name: 'useWindowedList',
          content: 'sections/hooks/use-windowed-list.md',
          sections: [
            {
              name: 'indexes',
              content: 'sections/getting-started.md'
            },
            {
              name: 'startSpace',
              content: 'sections/getting-started.md'
            },
            {
              name: 'endSpace',
              content: 'sections/getting-started.md'
            },
            {
              name: 'isScrolling',
              content: 'sections/getting-started.md'
            },
            {
              name: 'container',
              content: 'sections/getting-started.md'
            },
            {
              name: 'setRef',
              content: 'sections/getting-started.md'
            },
            {
              name: 'scrollTo',
              content: 'sections/getting-started.md'
            },
            {
              name: 'scrollToItem',
              content: 'sections/getting-started.md'
            }
          ]
        }
      ]
    }
  ],

  updateExample(props, exampleFilePath) {
    const settings = props.settings || {}

    if (typeof settings.file === 'string') {
      try {
        const { file, ...restSettings } = settings

        const filepath = path.resolve(path.dirname(exampleFilePath), file)

        return {
          content: fs.readFileSync(filepath, 'utf8'),
          settings: restSettings,
          lang: path.extname(filepath).replace(/^\./, '')
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
