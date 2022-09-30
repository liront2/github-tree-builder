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
const getEntireTree = async(ownerName, repoName, headSHA) => {
  const response = await instance.get(`${ownerName}/${repoName}/git/trees/${headSHA}?recursive=true`);
  const tree = response?.data?.tree;
  return tree;
}

function updateObject(target, toFindDir, value){
  // for the target object, find the toFindDir key, and there set the value
    if (target.hasOwnProperty(toFindDir) && typeof(value) === typeof(target[toFindDir])) {
      // update value if dir was found
      target[toFindDir] = {
        ...target[toFindDir],
        ...value
      };
    } else {
      for (const subDir in target) {
        if (!target[subDir].type) {
          // dirs are just props to more objects, and have no type
          updateObject(target[subDir], toFindDir, value)
        }
      }
    }
}

const buildTreeFileStructure = (tree) => {
  const output = tree.reduce(
    (acc, currentValue) => {
      const path = currentValue.path;
      if (path.includes('/')) {
        // sub folders and files building
        const splitPath = path.split('/');
        const name = splitPath.pop(); // pop the file name in the end, leave dir path
        const findDir = splitPath.pop(); // pop the deepest folder
        updateObject(acc, findDir, { [name]: currentValue.type === 'tree' ? {} : currentValue })
        return acc;
      } else {
        // root folder building
        return {
          ...acc,
          [path]: currentValue.type === 'tree' ? {} : currentValue
        }
      }
    },
    {}
  );
  
  return output;
}

module.exports = async(req, res, next) => {
  const { owner_name, repo_name } = req.params;
  let treeArray, headSHA;
  headSHA = await getTreeHeadSHA(owner_name, repo_name);
  if (!headSHA)  throw new Error('Could not extract the tree head SHA');
  
  treeArray = await getEntireTree(owner_name, repo_name, headSHA);
  if ([].length <= 0) throw new Error('Could not extract the tree array');

  const outputJsonTree = buildTreeFileStructure(treeArray);
  return outputJsonTree;
}
