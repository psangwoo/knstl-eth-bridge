import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { CreateOrder, QueryOrder } from "../api/Order";

const Knstl = (props) => {
    const [connected, setConnected] = useState(false);
    const [mnemonic, setMnemonic] = useState("cat cable orange column deposit bone hair intact rabbit quantum verb rent twenty since despair armor subway crowd uniform normal buffalo galaxy furnace drop");
    const [wallet, setWallet] = useState();
    const [client, setClient] = useState();
    const [amount, setAmount] = useState();
    const [orderid, setOrderid] = useState();
    const rpcEndpoint = "http://node7.konstellation.tech:26657";
    const corporateAddress = "darc139k62t62zx5gx4m02cc8r3r44ndshyy98p8x8q";
    const connectKnstl = async () => {
        // console.log(mnemonic);
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix: 'darc'});
        console.log("123");
        const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
        console.log("234");
        setClient(client);
        setWallet(wallet);
        setMnemonic("");
        setConnected(true);
    }

    const fetchTx = useCallback(async () => {
        let res = await QueryOrder(orderid);
        console.log(res);
        if (res === "order_created"){
            alert("Order Has been validated, swap now");
            props.setValidated(true);
        }
    }, [orderid]);

    useEffect(() => {
        if(orderid === undefined || orderid === '') return;
        fetchTx();
        const interval = setInterval(() => {
            fetchTx();
        }, 3000);
        return () => clearInterval(interval);
    }, [fetchTx]);

    const sendDARC = async () => {
        const [account] = await wallet.getAccounts();
        console.log(account);
        const res = await CreateOrder(
            "KNSTL",
            "ETH",
            account.address,
            "0x5B08716fCdA616F9D326D184267cA3a74C0993cB",
            parseFloat(amount)
        );
        if (res.result !== "Created") return;
        
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
        console.log(result);
        setOrderid(res.id);
        console.log(res);

    }
    const mnemonicEnter = (e) => {
        setMnemonic(e.target.value);
        // console.log(mnemonic);
    }
    const valueEnter = (e) => {
        setAmount(e.target.value);
    }
    return (
        <>
        { (orderid === undefined) ?
        <div>
            { !connected ?
            <>
                <Input
                    id="mnem"
                    aria-label="abcd"  
                    value={mnemonic || ""}
                    onChange={mnemonicEnter}
                    fullWidth
                    placeholder="Your wallet's mnemonic"
                />
                <h2/>
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
                    id="amount"
                    aria-label="abcd"
                    value={amount || ""}
                    onChange={valueEnter}
                    placeholder="Amount to Bridge"
                />
                &emsp;DARC
                <h2/>
                <Button
                    aria-label="abcd"
                    onPress={sendDARC}
                >
                    Send DARC to Bridge
                </Button>
            </>
            }
        </div>
        :
        <div>
            Waiting Order To be Done
        </div>
        }
        </>
    )
}



export default Knstl;