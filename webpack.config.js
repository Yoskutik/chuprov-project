/* eslint-disable @typescript-eslint/no-var-requires */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (env = {}, argv = {}) => {
    const isDev = argv.mode !== 'production';
    return {
        mode: isDev ? 'development' : 'production',
        context: path.resolve(__dirname, 'views'),
        cache: false,
        entry: './index.tsx',
        output: {
            filename: `static/${isDev ? '' : '[contenthash].'}bundle.js`,
            path: path.resolve(__dirname, 'app'),
            chunkFilename: `./static/chunks/${isDev ? '[id]' : '[contenthash]'}.chunk.js`,
            publicPath: '/',
        },
        devtool: isDev ? 'inline-source-map' : false,
        optimization: {
            minimize: !isDev,
            minimizer: [
                new TerserPlugin({
                    test: /.js$/i,
                    extractComments: false,
                    parallel: false,
                    terserOptions: {
                        output: { comments: false },
                    },
                }),
            ],
        },
        devServer: {
            open: true,
            port: 80,
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            alias: {},
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }, {
                test: /\.scss$/i,
                exclude: /node_modules/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                }, {
                    loader: 'css-loader',
                    options: { url: true },
                }, {
                    loader: 'postcss-loader',
                    options: {
                        postcssOptions: {
                            plugins: ['postcss-preset-env'],
                        },
                    },
                }, {
                    loader: 'sass-loader',
                }],
            }, {
                test: /\.(ttf|csv)$/,
                loader: 'file-loader',
                options: {
                    publicPath: '/static/assets/',
                    outputPath: './static/assets',
                    name: `${isDev ? '[name]' : '[contenthash]'}.[ext]`,
                },
            }, {
                test: /\.(tsv)$/,
                loader: 'csv-loader',
            }],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: `static/${isDev ? '' : '[fullhash].'}style.css`,
            }),
            new CleanWebpackPlugin(),
            new HtmlPlugin({
                filename: 'index.html',
                template: 'index.html',
                // favicon: path.resolve(__dirname, 'assets', 'favicon.svg'),
                cache: false,
                minify: isDev ? false : {
                    caseSensitive: false,
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: false,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    removeScriptTypeAttributes: true,
                    keepClosingSlash: false,
                    minifyJS: { compress: { conditionals: false } },
                    minifyCSS: true,
                    minifyURLs: true,
                    sortAttributes: true,
                    sortClassName: true,
                },
            }),
        ],
    };
};
