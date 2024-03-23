import "dotenv/config";
import api from "..";
import erc20abi from "../common/erc20.abi.json";

const main = async () => {
  const web3 = await api.getWeb3();
  const lpContract = await api.aave.getLendingPoolContract(web3);
  console.log("address", lpContract.address);
  const reservesAddresses = await lpContract.methods.getReserves().call();

  const info = {
    contracts: {
      "ETH": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    },
    decimals: {
      "ETH": 18,
    },
  };

  for (const reserveAddress of reservesAddresses) {
    if (reserveAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
      continue;
    }

    console.log(`Process: ${reserveAddress}`);
    const contract = new web3.eth.Contract(erc20abi, reserveAddress);

    try {
      const symbol = await contract.methods.symbol().call();
      const decimals = await contract.methods.decimals().call();
      info.contracts[symbol] = reserveAddress;
      info.decimals[symbol] = Number.parseInt(decimals);
    } catch(error) {
      console.log(`Fail with ${reserveAddress}:`, error);
    }
  }

  console.log(JSON.stringify(info, null, 2));
};

main().catch(console.error);
