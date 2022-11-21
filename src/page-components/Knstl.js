import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreateOrder, QueryOrder } from "../api/Order";

const Knstl = ({
    amount, 
    setAmount, 
    setValidated
    }) => {
    const [connected, setConnected] = useState(false);
    const [mnemonic, setMnemonic] = useState("cat cable orange column deposit bone hair intact rabbit quantum verb rent twenty since despair armor subway crowd uniform normal buffalo galaxy furnace drop");
    const [wallet, setWallet] = useState();
    const [client, setClient] = useState();
    const [orderid, setOrderid] = useState();
    const recipientRef = useRef();
    const rpcEndpoint = "http://node7.konstellation.tech:26657";
    const corporateAddress = "darc1xapv4pvpshhnxnqev267zkav7us9yp0e7lnk2e";
    const connectKnstl = async () => {
        // console.log(mnemonic);
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {prefix: 'darc'});
        // console.log("123");
        const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet);
        // console.log("234");
        setClient(client);
        setWallet(wallet);
        setMnemonic("");
        setConnected(true);
    }

    const fetchTx = useCallback(async () => {
        let res = await QueryOrder(orderid);
        console.log(res);
        if (res === "order_completed"){
            alert("Order Has been validated, swap now");
            setValidated(true);
        } else if (res === "order_failed") {
            alert('Order Has been failed. Retry');
            window.open('/');
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
            recipientRef.current.value,
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
                DARC to Bridge : &emsp;
                <Input
                    id="amount"
                    aria-label="abcd"
                    value={amount || ""}
                    onChange={valueEnter}
                    placeholder="Amount to Bridge"
                />
                &emsp;DARC
                <h2/>
                Recipient : &emsp;&emsp;&emsp;
                <Input
                    id="recipient"
                    aria-label="abcd"
                    ref={recipientRef}
                    placeholder="Recipient ETH address"
                />
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