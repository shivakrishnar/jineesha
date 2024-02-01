import fetch from 'node-fetch';

export async function getFileFromPreSignedURL(signedUrl: string) {
    const response = await fetch(signedUrl);
    return await response.text();
}