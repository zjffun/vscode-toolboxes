import { createCipheriv, randomFillSync } from "crypto";

const cipherAlgorithms = [
  "AES-128-CBC",
  "AES-128-CFB",
  "AES-128-CTR",
  "AES-128-ECB",
  "AES-128-OFB",
  "DES-CBC",
  "DES-ECB",
];

async function cipher(input, options) {
  const results = await Promise.allSettled(
    cipherAlgorithms.map((algorithm) => {
      let [type, arg2, arg3] = algorithm.split("-");
      let ivLength, keyLength, mode;

      if (type === "AES") {
        ivLength = keyLength = parseInt(arg2, 10) / 8;
        mode = arg3;
      } else if (type === "DES") {
        ivLength = keyLength = 8;
        mode = arg3 || arg2;
      }

      if (mode === "ECB") {
        ivLength = 0;
      }

      return new Promise((resolve, reject) => {
        const iv = randomFillSync(new Uint8Array(ivLength));
        const key = randomFillSync(new Uint8Array(keyLength));

        const ivHex = Buffer.from(iv).toString("hex");
        const keyHex = Buffer.from(key).toString("hex");

        let encrypted = "";

        try {
          const cipher = createCipheriv(algorithm, key, iv);
          cipher.setEncoding("hex");

          cipher.on("data", (chunk) => (encrypted += chunk));
          cipher.on("end", () => {
            resolve({ algorithm, iv: ivHex, key: keyHex, encrypted });
          });

          cipher.write(input);
          cipher.end();
        } catch (error) {
          resolve({
            algorithm,
            iv: ivHex,
            key: keyHex,
            encrypted: error.message || "Unknow error",
          });
        }
      }).catch((error) => {
        return {
          algorithm,
          encrypted: error.message || "Unknow error",
        };
      });
    })
  );

  return results
    .map(({ value: result }) => {
      const { algorithm, iv, key, encrypted } = result;
      return `${algorithm}
  key: ${key}
  iv: ${iv}
  encrypted: ${encrypted}`;
    })
    .join("\n\n");
}

export default cipher;
