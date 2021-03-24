'use strict';

let nodemailer = jest.genMockFromModule('nodemailer');

nodemailer = {
    createTransport: () => {
        console.log('Hitting nodemailer mock function')
        return { sendMail: () => {console.log('Hitting nodemailer mock function')} }
    }
}

module.exports = nodemailer;
