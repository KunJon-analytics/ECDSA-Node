import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";

const getAddress = (privateKey) => {
  if (secp.utils.isValidPrivateKey(privateKey)) {
    const publicKey = secp.getPublicKey(privateKey);
    const address = keccak256(publicKey.slice(1)).slice(-20);
    return `0x${toHex(address)}`;
  }
  return "";
};

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = getAddress(privateKey);
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>{`Your Wallet: ${address.slice(0, 4)}...${address.slice(-4)}`}</h1>

      <label>
        Private Key
        <input
          placeholder="Type your private key. Won't be send to the server"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
