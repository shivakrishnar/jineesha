var path = require('path');
var fs = require('fs');
const slsw = require('serverless-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: slsw.lib.entries,
    output: {
        libraryTarget: 'commonjs',
        filename: '[name].js',
        path: path.join(__dirname, 'dist'),
    },
    node: {
        __dirname: true,
    },
    target: 'node',
    externals: nodeModules,
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: [{ loader: 'ts-loader' }],
            },
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: [{ loader: 'url-loader?limit=100000' }],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: '../queries/**/*.sql',
                to: 'service/',
            },
        ]),
    ],
};
