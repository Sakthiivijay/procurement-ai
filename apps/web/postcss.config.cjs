// apps/web/postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- This is the new v4 plugin name
    autoprefixer: {},
  },
}