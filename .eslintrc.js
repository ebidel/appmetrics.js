module.exports = {
  "extends": ["eslint:recommended", "google"],
  "env": {
    "browser": true
  },
  "rules": {
    "quotes": [2, "single"],
    "prefer-const": 2,
    "max-len": [2, 100, {
      "ignoreComments": true,
      "ignoreUrls": true,
      "tabWidth": 2
    }],
  },
  "globals": {
    "ga": true,
    "window": true
  }
}
