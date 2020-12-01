/** Email Attachments as defined by nodemailer (described at https://nodemailer.com/message/attachments/ as of 11/13/2020)
 * @class Attachment
 * @constructor
 */

import { Stream } from 'nodemailer/lib/xoauth2';

export class Attachment {
    /**
     * @property {string} filename
     * filename to be reported as the name of the attached file. Use of unicode is allowed
     */

    /**
     * @property {string | Buffer | Stream} content
     * contents for the attachment if you want to include it directly instead of streaming it
     */

    /**
     * @property {string} path
     * path to the file if you want to stream the file instead of including it (better for larger attachments)
     */

    /**
     * @property {string} href
     * an URL to the file (data uris are allowed as well) if you don't want to stream or direct include it
     */

    /**
     * @property {string} httpHeaders
     * optional HTTP headers to pass on with the href request, eg. {authorization: "bearer ..."}
     */

    /**
     * @property {string} contentType
     * optional content type for the attachment, if not set will be derived from the filename property
     */

    /**
     * @property {string} contentDisposition
     * optional content disposition type for the attachment, defaults to ‘attachment’
     */

    /**
     * @property {string} cid
     * optional content id for using inline images in HTML message source
     */

    /**
     * @property {string} encoding
     * If set and content is string, then encodes the content to a Buffer using the specified encoding.
     * Example values: ‘base64’, ‘hex’, ‘binary’ etc. Useful if you want to use binary attachments in a JSON formatted email object.
     */

    /**
     * @property {string} headers
     * custom headers for the attachment node. Same usage as with message headers
     */

    /**
     * @property {string} raw
     * is an optional special value that overrides entire contents of current mime node including mime headers.
     * Useful if you want to prepare node contents yourself
     */

    /**
     * @property {string[]} properties
     * private list of properties to assign if provided in constructor
     * this ensures that
     */

    filename: string;
    content: string | Buffer | Stream;
    path: string;
    href: string;
    httpHeaders: string;
    contentTransferEncoding: string | boolean;
    contentType: string;
    contentDisposition: string;
    cid: string;

    public constructor(init?: Partial<Attachment>) {
        Object.assign(this, init);
    }
}
