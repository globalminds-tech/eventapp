module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@Services': './src/Services',
            '@Redux': './src/Redux',
            '@pages': './src/pages',
            '@components': './src/components',
            '@Organizer': './src/Organizer',
            '@Exhibitor': './src/Exhibitor',
            '@users': './src/users',
            '@super_user': './src/super_user',
            '@styles': './src/styles',
          },
        },
      ],
    ],
  };
};
