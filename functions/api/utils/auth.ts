export async function verifySessionToken(key, token){
  // key is the CLERK_JWT_KEY
  // token is the current JWT

  const RSA_PREFIX = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA';
  const RSA_SUFFIX = 'IDAQAB';

  console.log(token);

  // JWK https://datatracker.ietf.org/doc/html/rfc7517
  const jwk = {
    kty: 'RSA',
    n: key
        .slice(RSA_PREFIX.length, RSA_SUFFIX.length * -1)
        .replace(/\+/g, '-')
        .replace(/\//g, '_'),
    e: 'AQAB',
  };

  const algorithm = {
    name: 'RSASSA-PKCS1-v1_5',
    hash: 'SHA-256',
  };

  const importedKey = await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']);

  const [rawHeader, rawPayload, rawSignature] = token.split('.');

  const payload = JSON.parse(atob(rawPayload));

  const encoder = new TextEncoder();
  const data = encoder.encode([rawHeader, rawPayload].join('.'));
  const signature = parse(rawSignature);

  const isVerified = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', importedKey, signature, data);

  if(!isVerified){
    throw Error("Unverified");
  }

  return payload;
}

function parse(input: string) {
  const base64UrlEncoding = {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    bits: 6,
    codes: {},
  };

  // Build the character lookup table:
  for (let i = 0; i < base64UrlEncoding.chars.length; ++i) {
    base64UrlEncoding.codes[base64UrlEncoding.chars[i]] = i;
  }

  // Count the padding bytes:
  let end = input.length;
  while (input[end - 1] === '=') {
    --end;
  }

  // Allocate the output:
  const out = new Uint8Array(((end * base64UrlEncoding.bits) / 8) | 0);

  // Parse the data:
  let bits = 0; // Number of bits currently in the buffer
  let buffer = 0; // Bits waiting to be written out, MSB first
  let written = 0; // Next byte to write
  for (let i = 0; i < end; ++i) {
    // Read one character from the string:
    const value = base64UrlEncoding.codes[input[i]];
    if (value === undefined) {
      throw new Error('Invalid character ' + input[i]);
    }

    // Append the bits to the buffer:
    buffer = (buffer << base64UrlEncoding.bits) | value;
    bits += base64UrlEncoding.bits;

    // Write out some bits if the buffer has a byte's worth:
    if (bits >= 8) {
      bits -= 8;
      out[written++] = 0xff & (buffer >> bits);
    }
  }

  // Verify that we have received just enough bits:
  if (bits >= base64UrlEncoding.bits || 0xff & (buffer << (8 - bits))) {
    throw new Error('Unexpected end of data');
  }

  return out;
}
