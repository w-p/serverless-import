'use strict';
const fs = require('fs');
const _ = require('lodash');
const yaml = require('js-yaml');

class ServerlessImportPlugin {
  constructor(serverless, options) {
    this.options = options;
    this.serverless = serverless;
    this.variableResolvers = {
      partial: this.resolvePartial.bind(this),
    };
    this.resolveImport();
  }

  resolveImport() {
    let slsConfig = this.serverless.pluginManager.serverlessConfigFile;
    const bytes = fs.readFileSync(slsConfig.import);
    const importConfig = yaml.safeLoad(bytes);
    this.common = importConfig.common;
    this.partial = importConfig.partial;
    delete slsConfig.import;
    slsConfig = _.mergeWith(slsConfig, this.common, dst => {
      if (typeof dst !== 'object') {
        // if this is a leaf node, use the gaining configs value
        return dst;
      }
    });
  }

  resolvePartial(predicate) {
    return new Promise((resolve, reject) => {
      const path = predicate.split(':')[1];
      const value = _.get(this.partial, path);
      if (!path || !value) {
        reject('Invalid partial provided');
      } else {
        resolve(value);
      }
    });
  }
}

module.exports = ServerlessImportPlugin;
