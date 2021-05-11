'use strict';

let pdflib = jest.genMockFromModule('pdf-lib');
const mockData = require('../mock-data');
const listSignatureRequests = require('../mock-functions/hellosign-list-requests');

const pdfDoc = {
    embedJpg: () => {
        return {
            width: 1,
            height: 1,
        };
    },
    embedPng: () => {
        return {
            width: 1,
            height: 1,
        };
    },
    addPage: () => {
        return {
            drawImage: () => {},
            getSize: () => {
                return {
                    width: 1,
                    height: 1,
                };
            },
            drawText: () => {},
            drawSvgPath: () => {},
        };
    },
    registerFontkit: () => {},
    embedFont: () => {
        return {
            widthOfTextAtSize: () => {
                return 1;
            },
            heightAtSize: () => {
                return 1;
            },
        };
    },
    save: () => {
        return 'test';
    },
};

pdflib = {
    PDFDocument: {
        create: () => {
            return pdfDoc;
        },
        load: () => {
            return pdfDoc;
        },
    },
    rgb: () => {
        return {};
    },
};

module.exports = pdflib;
