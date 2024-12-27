// babel.config.mjs
export default {
    presets: [
        'babel-preset-react-app',
        '@babel/preset-typescript',
    ],
    plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ],
};
