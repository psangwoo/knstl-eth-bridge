import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Button, Input } from "@nextui-org/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreateOrder, QueryOrder } from "../api/Order";
import { priceFetcher } from '../helper/Swapestimation';

const Knstl = ({ amount, setAmount, setValidated }) => {
    const [connected, setConnected] = useState(false);
    const [mnemonic, setMnemonic] = useState("cat cable orange column deposit bone hair intact rabbit quantum verb rent twenty since despair armor subway crowd uniform normal buffalo galaxy furnace drop");
    const [wallet, setWallet] = useState();
    const [client, setClient] = useState();
    const [orderid, setOrderid] = useState();
    const [minoutput, setMinoutput] = useState();
    const recipientRef = useRef();
    const rpcEndpoint = "http://node7.konstellation.tech:26657";
    const corporateAddress = "darc1xapv4pvpshhnxnqev267zkav7us9yp0e7lnk2e";
    const wethtokenAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
    const wrappedDarcAddress = "0xFbAf1f87EfAdF0fb2f591C6D88404A1B673604De";
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
            window.location.replace('/');
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

    useEffect(() => {
        const fetchPrice = async () => {
            const min_amount = await priceFetcher(
                parseFloat(amount),
                wrappedDarcAddress,
                wethtokenAddress
            );
            setMinoutput(min_amount);
        }
        fetchPrice();
        return ;
    }, [amount]);

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
                <h2/>
                {minoutput !== undefined &&
                    <>Estimated amount : {minoutput} ETH </>
                }
                <Button
                    aria-label="abcd"
                    onPress={sendDARC}
                >
                    Send DARC to Bridge
                </Button>
                <h2/>
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