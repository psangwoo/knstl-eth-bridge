import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";

const Knstl = (props) => {
    const [connected, setConnected] = useState(false);
    const [mnemonic, setMnemonic] = useState("cat cable orange column deposit bone hair intact rabbit quantum verb rent twenty since despair armor subway crowd uniform normal buffalo galaxy furnace drop");
    const [wallet, setWallet] = useState();
    const [client, setClient] = useState();
    const [amount, setAmount] = useState();
    const [txhash, setTxhash] = useState();
    const rpcEndpoint = "http://node7.konstellation.tech:26657";
    const corporateAddress = "darc139k62t62zx5gx4m02cc8r3r44ndshyy98p8x8q";
    const connectKnstl = async () => {
        // console.log(mnemonic);
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix: 'darc'});
        const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
        setClient(client);
        setWallet(wallet);
        setMnemonic("");
        setConnected(true);
    }

    const fetchTx = useCallback(async () => {
        await fetch(rpcEndpoint.concat("/tx?hash=0x").concat(txhash))
        .then( response => response.json())
        .then( data => {
            if (data.result.hash === txhash)
                props.setValidated(true);
        });
    }, [txhash]);

    useEffect(() => {
        if(txhash === undefined || txhash === '') return;
        fetchTx();
        const interval = setInterval(() => {
            fetchTx();
        }, 3000);
        return () => clearInterval(interval);
    }, [fetchTx]);

    const sendDARC = async () => {
        const [account] = await wallet.getAccounts();
        // console.log(account);
        const sendAmount = {
            denom: 'udarc',
            amount: (parseFloat(amount) * 1000000).toString(),
        };
        const fee = {
            amount: [
              {
                denom: "udarc",
                amount: "10",
              },
            ],
            gas: "1600000",
        };
        // console.log(sendAmount);
        const result = await client.sendTokens(account.address, corporateAddress, [sendAmount], fee);
        setTxhash(result.transactionHash);
    }
    const mnemonicEnter = (e) => {
        setMnemonic(e.target.value);
        // console.log(mnemonic);
    }
    const valueEnter = (e) => {
        setAmount(e.target.value);
    }
    return (
        <div>
            { !connected ?
            <>
                <Input
                    aria-label="abcd"  
                    value={mnemonic}
                    onChange={mnemonicEnter}
                    fullWidth
                    placeholder="Your wallet's mnemonic"
                />
                <Button
                    aria-label="abcd"
                    onPress={connectKnstl}
                >
                    Connect to Konstellation
                </Button>
            </>
            :
            <>
                <Input
                    aria-label="abcd"
                    value={amount}
                    onChange={valueEnter}
                    placeholder="Amount to Bridge"
                />
                &emsp;DARC
                <Button
                    aria-label="abcd"
                    onPress={sendDARC}
                >
                    Send DARC to Bridge
                </Button>
            </>
            }
        </div>
    )
}



export default Knstl;