const RSA = require('hybrid-crypto-js').RSA;

const createRSApair = () => {
  const rsa = new RSA({
    keySize: 2048,
  });
  return rsa.generateKeyPairAsync();
};

export default createRSApair;