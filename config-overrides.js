import getCacheIdentifier from 'react-dev-utils/getCacheIdentifier.js'; // Note the '.js' extension

export default function override(config, webpackEnv) {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';
    const loaders = config.module.rules[1].oneOf;

    loaders.splice(loaders.length - 1, 0, {
        test: /\.(js|mjs|cjs)$/,
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        loader: 'babel-loader',
        options: {
            babelrc: false,
            configFile: false,
            compact: false,
            presets: [
                [
                    'babel-preset-react-app/dependencies',
                    { helpers: true },
                ],
            ],
            cacheDirectory: true,
        },
    });

    return config;
}
