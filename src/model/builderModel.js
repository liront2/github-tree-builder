'use strict';

const axios = require('axios');

const { GITHUB_BASE_URL } = require('../helpers/environmentVariables');
const logger = require('../helpers/logger');

const instance = axios.create({
  baseURL: GITHUB_BASE_URL,
  timeout: 30000,
});

instance.interceptors.request.use(function (config) {
  logger.trace(`sending ${config.method} to ${config.baseURL}/${config.url}`);
  return config;
}, function (error) {
  return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  logger.trace(`received ${response?.status} from Github API`);
  return response;
}, function (error) {
  logger.error(`request to ${error.config.baseURL}/${error.config.url} failed (${error.response?.status} - ${error.response.statusText})`);
  return Promise.reject(error);
});

const getTreeHeadSHA = async(ownerName, repoName) => {
    const response = await instance.get(`${ownerName}/${repoName}/branches/master`);
    const headSHA = response?.data?.commit?.commit?.tree?.sha;
    return headSHA;
}

// TODO: rate-limit solution, recursive=false in the future
const getTree = async(ownerName, repoName, headSHA) => {
  const response = await instance.get(`${ownerName}/${repoName}/git/trees/${headSHA}`);
  const tree = response?.data?.tree;
  return tree;
}

const buildStructurePromise = async (owner, repo, obj, output) => {
  const subTree = await getTree(owner, repo, obj.sha);
  await buildTreeFileStructure(owner, repo, subTree, output);
}

const buildTreeFileStructure = async (owner, repo, tree, output) => {
  const promises = []
  for (let obj of tree) {
    if (obj.type === 'tree') {
      output[obj.path] = { ...obj, tree: {} };
      promises.push(buildStructurePromise(owner, repo, obj, output[obj.path].tree));
      await Promise.all(promises)
    } else {
      // blob
      output[obj.path] = obj;
    }
  }
  return output;
}

module.exports = async(req, res, next) => {
  const { owner_name, repo_name } = req.params;
  let treeHead, headSHA;
  headSHA = await getTreeHeadSHA(owner_name, repo_name);
  if (!headSHA)  throw new Error('Could not extract the tree head SHA');
  
  treeHead = await getTree(owner_name, repo_name, headSHA);
  if (treeHead.length <= 0) throw new Error('Could not extract the tree array');

  const outputJsonTree = await buildTreeFileStructure(owner_name, repo_name, treeHead, {});
  return outputJsonTree;
}
