'use strict';

const fs = require('fs');
const path = require('path');

const crypto = require('crypto');
const yaml = require('yaml-cfn');
const ZipPlugin = require('zip-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function parseHandlerPath(handlerPath, base) {
  if (!base) base = __dirname;
  const splitPath = handlerPath.split('.');
  const fn = splitPath[1];
  const splitDir = splitPath[0].split('/');
  const file = splitDir[splitDir.length - 1];
  const relative = splitDir.length > 1 ? path.join.apply(null, splitDir.slice(0, -1)) : '';
  const absolute = path.join(__dirname, relative);
  const ret = {
    fn: fn,
    file: file,
    relative: relative,
    absolute: absolute
  };
  return ret;
}

function archiveFromPath(filePath) {
  return [
    filePath.replace(/[./]/g, '-').replace(/^-+/g,''),
    crypto.createHash('md5').update(filePath).digest().toString('hex').substr(0, 6),
  ].join('.');
}

module.exports = function () {

  const doc = yaml.yamlParse(fs.readFileSync(path.join(__dirname, 'template.yml')));
  const res = doc.Resources;

  const keys = Object.keys(res)
    .filter((key) => res[key].Type === 'AWS::Serverless::Function')
    .map((key) => [key, './' + parseHandlerPath(res[key].Properties.Handler).relative + '/' + parseHandlerPath(res[key].Properties.Handler).file])
    .reduce((prev,curr) => {
      const file = curr[1] + '.js';
      prev[curr[0]] = {
        path: file,
        archive: archiveFromPath(file) + '.zip'
      };
      return prev;
    }, {});
  const files = Array.from(new Set(Object.values(keys).map((file) => file.path)));

  // Main file configuration
  
  const config = files.map((file) => {
    const outname = archiveFromPath(file);
    return {
      context: path.resolve(__dirname),
      mode: 'production',
      entry: file,
      output: {
        path: path.join(__dirname, 'dist', 'webpack'),
        filename: file,
        libraryTarget: 'commonjs2'
      },
      optimization: {
        minimize: false,
        namedModules: true
      },
      plugins: [
        new ZipPlugin({
          filename: outname + '.zip',
          path: '../package'
        })
      ],
      module: {
        rules: [
          {
            test: /\.js$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [[ 'env', { 'targets': { 'node': '8.10' } } ]],
                  plugins: [
                    'transform-async-to-generator',
                    'transform-object-rest-spread'
                  ],
                  compact: false,
                  babelrc: false
                }
              }
            ]
          }
        ]
      },
      target: 'node',
      externals: {
        'aws-sdk': 'aws-sdk',
        'awslambda': 'awslambda',
        'dynamodb-doc': 'dynamodb-doc',
        'imagemagick': 'imagemagick'
      },
      node: {
        __filename: false,
        __dirname: false
      },
      bail: true
    };
  });

  // Compile template
  config[0].plugins.push(
    new CopyWebpackPlugin([{
      from: 'template.yml',
      to: '../package',
      transform () {
        const template = JSON.parse(JSON.stringify(doc));
        for (let key of Object.keys(keys)) {
          const props = template.Resources[key].Properties;
          props.CodeUri = './' + keys[key].archive;
        }
        return Buffer.from(yaml.yamlDump(template));
      }
    }])
  );

  return config;
};