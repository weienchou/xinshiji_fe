const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const minify = require('html-minifier').minify;
const JSONMinifyPlugin = require('node-json-minify');

const f_root = path.resolve(__dirname, '../');
const f_src = path.join(f_root, 'src');
const f_dist = path.join(f_root, 'dist');

const IS_DEV = process.env.NODE_ENV === 'dev';

const minify_cfgs = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    sortAttributes: true,
    useShortDoctype: true,
};

const htmls = ['index'];

const static = [];

let webpackConfig = {
    entry: {
        bundle: path.join(f_src, 'scripts/main'),
        vendor: ['jquery'],
    },
    module: {
        rules: [
            {
                test: /\.ejs$/,
                use: {
                    loader: 'ejs-compiled-loader',
                    options: {
                        htmlmin: true,
                        htmlminOptions: {
                            removeComments: true,
                        },
                    },
                },
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            // sourceMap: true,
                            postcssOptions: {
                                ident: 'postcss',
                                plugins: [
                                    require('tailwindcss'),
                                    require('autoprefixer')({
                                        overrideBrowserslist: ['> 1%', 'last 5 versions', 'Firefox >= 45', 'ios >= 8', 'ie >= 10', 'not dead'],
                                    }),
                                ],
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(woff|woff2|ttf|otf|eot)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'font',
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1000,
                            name: '[name].[ext]',
                            // context: path.resolve(__dirname, 'src/'),
                            outputPath: 'images',
                            // publicPath: 'dist',
                            // useRelativePaths: true
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'styles/[name].css',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(f_src, 'images'),
                    to: path.join(f_dist, 'images'),
                },
                /*{
                    from: path.join(f_src, 'scripts/data'),
                    to: path.join(f_dist, 'scripts/data')
                }, */ {
                    from: path.join(f_src, 'scripts/tmpls'),
                    to: path.join(f_dist, 'scripts/tmpls'),
                    transform(content, path) {
                        return minify(content.toString(), minify_cfgs);
                    },
                },
            ],
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            // moment: 'moment'
        }),
        new webpack.DefinePlugin({
            IS_DEV: IS_DEV,
        }),
    ],
};

htmls.forEach((file) => {
    webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
            template: path.join(f_src, file + '.ejs'),
            filename: file + '.html',
            minify: minify_cfgs,
            inject: true,
            templateParameters: {
                promo: require(path.join(f_src, 'scripts/data/promo.json')),
            },
            chunks: ['bundle', 'vendor'],
        })
    );
});

static.forEach((file) => {
    webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
            template: path.join(f_src, file + '.ejs'),
            filename: file + '.html',
            minify: minify_cfgs,
            inject: true,
            templateParameters: {},
            chunks: ['static', 'vendor'],
        })
    );
});

module.exports = webpackConfig;
