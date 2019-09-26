const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    entry: path.resolve(__dirname, 'src/facade/index.tsx'),

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/, loader: 'babel-loader', exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.ya?ml$/,
                use: [
                    { loader: 'json-loader' },
                    { loader: 'yaml-loader' },
                    { loader: 'yaml-lint-loader' },
                ],
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader'
                }]
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader', // creates style nodes from JS strings
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                    },
                    {
                        loader: 'less-loader', // compiles Less to CSS
                        options: {
                            modifyVars: require("./theme").antd,
                            javascriptEnabled: true,
                        }
                    },
                ],
            },],
    },

    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerHost: '127.0.0.1',
            analyzerPort: 8889,
            reportFilename: 'report.html',
            defaultSizes: 'parsed',
            openAnalyzer: true,
            generateStatsFile: false,
            statsFilename: 'stats.json',
            statsOptions: null,
            logLevel: 'info',
        }),
    ]
};