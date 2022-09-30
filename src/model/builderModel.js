'use strict';

const axios = require('axios');
const { GITHUB_BASE_URL } = require('../config/environmentVariables');

// TODO: temp
const tree = require('../../test');

const instance = axios.create({
  baseURL: GITHUB_BASE_URL,
  timeout: 10000,
});

const getTreeHeadSHA = async(ownerName, repoName) => {
  try {
    const response = await instance.get(`${ownerName}/${repoName}/branches/master`);
    const headSHA = response?.data?.commit?.commit?.tree?.sha;
    if (headSHA) return headSHA;
  } catch (error) {
    throw new Error('tree head SHA could not be fetched' + JSON.stringify(error));
  }
}

// TODO: optimize
const getEntireTree = async(ownerName, repoName, headSHA) => {
  try {
    const response = await instance.get(`${ownerName}/${repoName}/git/trees/${headSHA}?recursive=true`);
    const tree = response?.data?.tree;
    if (tree) return tree
  } catch (error) {
    throw new Error('We encountered a problem fetching the tree from Github' + JSON.stringify(error));
  }
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
        // sub folders building
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
  try {
    const headSHA = await getTreeHeadSHA(owner_name, repo_name);
    if (headSHA) {
      const treeArray = await getEntireTree(owner_name, repo_name, headSHA);
      const outputJsonTree = buildTreeFileStructure(treeArray);
      return outputJsonTree;
    }
    throw new Error('No tree head was found')
  } catch (err) {
    return next(err);
  }
}
