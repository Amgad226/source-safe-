import { createHmac } from 'crypto';
const secretKey = 'secret_key';

export function signUrl(
  endpoint: string,
  url: string,
  expirationTime: number,
): string {
  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const nonce = generateNonce(); // Generate a random nonce
  const signature = createHmac('sha256', secretKey)
    .update(`${url}${timestamp}${nonce}${expirationTime}`)
    .digest('hex');

  return `${endpoint}?signature=${signature}&url=${url}&timestamp=${timestamp}&nonce=${nonce}&expires=${expirationTime}`;
}

export function validateSignedUrl(
  url: string,
  signature: string,
  timestamp: string,
  nonce: string,
  expires: string,
): { status: boolean; msg: string } {
  // return true ;
  if (!signature || !timestamp || !nonce || !expires) {
    return {
      status: false,
      msg: 'Signature or timestamp or expires or nonce is missing',
    };
  }
  // Compare the provided signature with the expected signature
  const expectedSignature = createHmac('sha256', secretKey)
    .update(`${url}${timestamp}${nonce}${expires}`)
    .digest('hex');
  if (expectedSignature != signature) {
    return {
      status: false,
      msg: 'the url not valid because edit it ',
    };
  }

  // Check if the timestamp is within the validity period
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const expirationTime = Number(expires);

  if (currentTimestamp - Number(timestamp) > expirationTime) {
    return {
      status: false,
      msg: 'URL is expired cause time out',
    };
  }
  return {
    status: true,
    msg: 'correct',
  };
}

export function generateNonce(): string {
  // Generate a random string (nonce) for added security
  return Math.random().toString(36).substr(2);
}
