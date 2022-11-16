

module.exports = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.pdf$/i,
      use: ['file-loader'],
    });
  return config;
  },
};