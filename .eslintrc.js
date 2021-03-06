module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx'],
      },
    ],
    'react/prop-types': 0,
    'no-underscore-dangle': 0,
    'import/imports-first': ['error', 'absolute-first'],
    'import/newline-after-import': 'error',
    'no-console': 'off',
    'no-restricted-syntax': 'off',
    'no-undef': 'off',
    'jsx-a11y/media-has-caption': 'off',
    'jsx-a11y/label-has-for': [
      2,
      {
        components: ['Label'],
        required: {
          some: ['nesting', 'id'],
        },
        allowChildren: false,
      },
    ],
    'react/no-array-index-key': 'off',
    'exhaustive-deps': 'error',
  },
};
