'use strict';

const path = require('path');

const fs = jest.genMockFromModule('fs');

let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
    mockFiles = Object.create(null);
    for (const file in newMockFiles) {
        const dir = path.dirname(file);

        if (!mockFiles[dir]) {
            mockFiles[dir] = [];
        }
        mockFiles[dir].push(path.basename(file));
    }
}

let forceError;
function __forceError(process) {
    forceError = process;
}

function mkdir(path, cb) {
    if (forceError && forceError === 'mkdir') {
        cb('Force an error');
    }
    return;
}
function mkdirSync(path) {
    return;
}
function writeFile(path, file, encoding, cb) {
    if (forceError && forceError === 'writeFile') {
        cb('Force an error');
    }
    return;
}
function writeFileSync(path, file, encoding) {
    return;
}
function unlink(path, cb) {
    if (forceError && forceError === 'unlink') {
        cb('Force an error');
    }
    return;
}
function rmdir(path, cb) {
    if (forceError && forceError === 'rmdir') {
        cb('Force an error');
    }
    return;
}
function readFileSync() {
    return 'test';
}
function readdirSync() {
    return ['test1.pdf', 'test2.pdf', 'usp_EIN_Cons_Dynamic_V1.sql'];
}

fs.__setMockFiles = __setMockFiles;
fs.__forceError = __forceError;
fs.mkdir = mkdir;
fs.writeFile = writeFile;
fs.unlink = unlink;
fs.rmdir = rmdir;
fs.readFileSync = readFileSync;
fs.readdirSync = readdirSync;

module.exports = fs;
