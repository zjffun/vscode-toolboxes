import { createHash } from "crypto";

const digestAlgorithms = [
  "MD5",
  "SHA1",
  "MD5-SHA1",
  "MD4",
  "SHA256",
  "SHA512",
  "BLAKE2b512",
  "BLAKE2s256",
  "MDC2",
  "RIPEMD160",
  "SHA224",
  "SHA3-224",
  "SHA3-256",
  "SHA3-384",
  "SHA3-512",
  "SHA384",
  "SHA512-224",
  "SHA512-256",
  "SHAKE128",
  "SHAKE256",
  "SM3",
  "whirlpool",
];

function hash(input) {
  return digestAlgorithms
    .map((name) => {
      let result;

      try {
        const hash = createHash(name);
        hash.update(input);
        result = hash.digest("hex");
      } catch (error) {
        result = `${
          error.message || "Unknow Error"
        }.(Please check OpenSSL version)`;
      }

      return `${name}: ${result}`;
    })
    .join("\n");
}

export default hash;
