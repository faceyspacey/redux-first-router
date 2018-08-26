module.exports = {
  presets: ['@babel/env', '@babel/react', '@babel/flow'],
  plugins: [
    '@babel/proposal-object-rest-spread',
    '@babel/proposal-class-properties',
  ],
  env: {
    es: {
      presets: [['@babel/env', { modules: false }]],
    },
  },
}
