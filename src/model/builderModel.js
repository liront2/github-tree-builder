'use strict';

const axios = require('axios');

const { GITHUB_BASE_URL } = require('../helpers/environmentVariables');

const instance = axios.create({
  baseURL: GITHUB_BASE_URL,
  timeout: 30000,
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

const buildTreeFileStructure = async (owner, repo, tree, output) => {

  for (let obj of tree) {
    if (!obj.path.includes('/')) {
      if (obj.type === 'tree') {
        const subTree = await getTree(owner, repo, obj.sha);
        output[obj.path] = { ...obj, tree: {} };
        await buildTreeFileStructure(owner, repo, subTree, output[obj.path].tree);
      } else {
        output[obj.path] = obj;
      }
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

  const outputJsonTree = {}
  await buildTreeFileStructure(owner_name, repo_name, treeHead, outputJsonTree);
  return outputJsonTree;
}
