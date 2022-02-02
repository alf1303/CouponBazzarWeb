const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: [
        './src/main.js'
    ],
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, './dist')
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: false, //not include path to bundled js, becouse it is present in indexhml template
            filename: 'index.html',
            template: './index.html', //from where to get index.html
        })
    ],
    output: {
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
};