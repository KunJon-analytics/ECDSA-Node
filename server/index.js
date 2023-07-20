const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "0x5c8faa3594a32b80862d03e2dab5ac8fc75a5bbd": 100,
  "0x34b9de0ff925ba99eef35b215f06d74bd6e9f5d6": 50,
  "0xe3de02fcb5d3fb6a669ce222b8d69d8f19965782": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  try {
    const { signature, hexMessage, recoveryBit, sender, recipient, amount } =
      req.body;

    const signaturePublicKey = secp.recoverPublicKey(
      hexMessage,
      signature,
      recoveryBit
    );
    const signatureAddressNotHex = keccak256(signaturePublicKey.slice(1)).slice(
      -20
    );
    const signatureAddress = "0x" + toHex(signatureAddressNotHex);

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else if (signatureAddress !== sender) {
      res.status(400).send({ message: "You are not the person!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
