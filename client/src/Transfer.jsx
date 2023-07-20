import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";
import { utf8ToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState("");
  const [recoveryBit, setRecoveryBit] = useState("");
  const [hexMessage, setHexMessage] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    if (!address || !privateKey) {
      alert("please Input a valid private key");
      return;
    }

    try {
      const transactionMessage = {
        sender: address,
        amount: parseInt(sendAmount),
        recipient: recipient,
      };

      const hashedMessage = keccak256(
        utf8ToBytes(JSON.stringify(transactionMessage))
      );
      const hexMessage = toHex(hashedMessage);

      setHexMessage(hexMessage);

      const [signatureUint, recoveryBit] = await secp.sign(
        hexMessage,
        privateKey,
        {
          recovered: true,
        }
      );
      const signature = toHex(signatureUint);
      setSignature(signature);
      setRecoveryBit(recoveryBit);
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature,
        recoveryBit,
        hexMessage,
      });
      setBalance(balance);
    } catch (error) {
      alert(error?.response?.data?.message || error);
      console.log(error);
    }
  }
  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2da..."
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
      <div>
        Your transaction hash: {hexMessage.slice(0, 4)}...
        {hexMessage.slice(-4)}
      </div>
      <div>
        Your signature: {signature.slice(0, 4)}...{signature.slice(-4)}
      </div>
      <div>Your recoveryBit: {recoveryBit}</div>
    </form>
  );
}

export default Transfer;
