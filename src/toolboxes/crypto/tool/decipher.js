import { createDecipheriv } from "crypto";

async function decipher(input, options) {
  return new Promise((resolve, reject) => {
    const iv = new Uint8Array(Buffer.from(options.iv, "hex"));
    const key = new Uint8Array(Buffer.from(options.key, "hex"));

    let decrypted = "";

    try {
      const decipher = createDecipheriv(options.algorithm, key, iv);

      decipher.on("data", (chunk) => (decrypted += chunk));
      decipher.on("end", () => {
        resolve(decrypted);
      });

      decipher.write(input, "hex");
      decipher.end();
    } catch (error) {
      resolve(error.message || "Unknow error");
    }
  }).catch((error) => {
    return error.message || "Unknow error";
  });
}

export default decipher;
