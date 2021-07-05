const path = require('path');
const glob = require('glob');
const webpackConfig = require('./webpack.config');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const f_root = path.resolve(__dirname, '../');
const f_src = path.join(f_root, 'src');
const f_dist = path.join(f_root, 'dist');

webpackConfig.devtool = 'cheap-module-source-map';
webpackConfig.mode = 'production';

webpackConfig.optimization = {
    minimizer: [
        new TerserWebpackPlugin({
            test: /\.js(\?.*)?$/i,
            parallel: true,
            sourceMap: true,
            terserOptions: {
                keep_classnames: false,
                keep_fnames: false,
                compress: {
                    // drop_console: true,
                },
                output: {
                    beautify: false,
                    comments: false
                }
            }
        }),
    ],
    runtimeChunk: {
        name: 'runtime'
    },
    splitChunks: {
        chunks: 'all',
        name: true,
        cacheGroups: {
            commons: {
                chunks: 'initial',
                name: 'commons', //分割出來的檔案命名
                minChunks: 2, //被引入2次以上的code就會被提取出來
                priority: 1, //檔案的優先順序，數字越大表示優先級越高
            },
            vendor: {
                test: /[\\/]node_modules[\\/]/, //提取引入的模組
                chunks: 'initial',
                name: 'vendor', //分割出來的檔案命名
                priority: 2, //檔案的優先順序，數字越大表示優先級越高
                enforce: true
            }
        },
    },
}

webpackConfig.plugins.push(
    new CleanWebpackPlugin()
);

// webpackConfig.plugins.push(
//     new PurgecssPlugin({
//         paths: glob.sync(`${f_src}/**/*`, { nodir: true }),
//     })
// );

webpackConfig.plugins.push(
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano').process,
        cssProcessorPluginOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
        },
        canPrint: true
    })
);

webpackConfig.output = {
    publicPath: 'dist',
    path: path.join(__dirname, '../dist'),
    filename: 'scripts/[name].js'
};

module.exports = webpackConfig;
