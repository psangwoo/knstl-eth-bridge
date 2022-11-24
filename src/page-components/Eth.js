import { Button, Input } from '@nextui-org/react';
import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import SwapHandler from "../abi/SwapHandler.json";
import WrappedDarc from "../abi/WrappedDarc.json";
import { CreateOrder } from "../api/Order";
import { priceFetcher } from '../helper/Swapestimation';
const Eth = () => {
    const [account, setAccount] = useState();
    const [amount, setAmount] = useState('');
    const [approve, setApprove] = useState(false);
    const [explorer, setExplorer] = useState();
    const [minoutput, setMinoutput] = useState();
    const [balances, setBalances] = useState({
        'DARC': 0,
        'SWAP': 0,
        'ETH': 0
    });
    const [web3, setWeb3] = useState();
    const swapHandlerAddress = "0x3FAF95A83A1191CE70f82d0c7aaD52e66DB4D289";
    const wrappedDarcAddress = "0xFbAf1f87EfAdF0fb2f591C6D88404A1B673604De";
    const swaptokenAddress = "0x06B10F70e24304cF870513f15d74D7Dac6cEd913";
    const wethtokenAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

    const ConnectMetaMask = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
        const _web3 = new Web3(window.ethereum);
        
        setAccount(accounts[0]);
        setWeb3(_web3);
        console.log(_web3.utils.toChecksumAddress(window.ethereum.selectedAddress));
        // console.log(account);
    }
    const checkAllowance = async () => {
        // console.log("Check Allowance");
        // console.log(account);
        if (account === undefined || isNaN(amount) || amount === '') return;

        const WrappedDarcContract = new web3.eth.Contract(WrappedDarc, wrappedDarcAddress);
        // console.log(WrappedDarcContract);
        const data = await WrappedDarcContract.methods.allowance(
            account,
            swapHandlerAddress
        ).call();
        setApprove(parseInt(data) >= parseInt(web3.utils.toWei(amount)));
        // console.log(amount);
        // console.log(approve);
        // console.log(data);
    }
    useEffect(async () => {
        checkAllowance();
        const min_amount = await priceFetcher(
            parseFloat(amount),
            wethtokenAddress,
            wrappedDarcAddress
        );
        setMinoutput(min_amount);
        return ;
    }, [amount]);
    const getBalances = useCallback(async () => {
        const WrappedDarcContract = new web3.eth.Contract(WrappedDarc, wrappedDarcAddress);
        const SwapTokenContract = new web3.eth.Contract(WrappedDarc, swaptokenAddress);
        const darcBalance = await WrappedDarcContract.methods.balanceOf(account).call();
        const swapBalance = await SwapTokenContract.methods.balanceOf(account).call();
        const ethBalance = await web3.eth.getBalance(account);

        await checkAllowance();
        setBalances({
            'DARC': parseFloat(web3.utils.fromWei(darcBalance)),
            'SWAP': parseFloat(web3.utils.fromWei(swapBalance)),
            'ETH' : parseFloat(web3.utils.fromWei(ethBalance))
        });
    }, [account]);
    useEffect(() => {
        if(account === undefined) return;
        getBalances();
        const interval = setInterval(() => {
            getBalances();
        }, 1000);
        return () => clearInterval(interval);
    }, [getBalances]);


    const ETHtoDARCswap = async () => {
        // console.log("Execute Transaction: SwapHandler Contract");

        const {result, id} = await CreateOrder(
            "ETH",
            "KNSTL",
            web3.utils.toChecksumAddress(window.ethereum.selectedAddress),
            "darc18aq2sypunel3yv4m2axlng97h43uj4jwrc997f",
            10,
        );
        if(result !== "Created")
            return;
        const SwapHandlerContract = new web3.eth.Contract(SwapHandler, swapHandlerAddress);
        const swapDARCtoETHTx = SwapHandlerContract.methods['swapETHtoDARC']();
    
        // console.log("params : ", swapDARCtoETHTx);
        const transactionParameters = {
            to: swapHandlerAddress,
            from: window.ethereum.selectedAddress, // must match user's active address.
            data: swapDARCtoETHTx.encodeABI(),
            value: web3.utils.toHex(web3.utils.toWei(amount)),
        };

        const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
        });

        console.log(txHash);
        setExplorer(`https://goerli.etherscan.io/tx/${txHash}`);
    }
    const gotoExplorer = () => {
        window.open(explorer);
    }
    const inputEnter = (e) => {
        setAmount(e.target.value);
    }

     return(
        <div>
            {account === undefined
                ?
                <Button
                    onPress={ConnectMetaMask}
                >
                    Connect Metamask Wallet
                </Button>
                :
                <div>

                    Connected to : {account}
                    <h1/>
                    Balance :
                    <h1/>
                    &emsp;&emsp;ETH : {balances.ETH}
                    <h1/>
                    &emsp;&emsp;DARC : {balances.DARC}
                    <h1/>
                    &emsp;&emsp;SWAP : {balances.SWAP}
                    <h1/>
                    <Input
                        id='amnt'
                        aria-label="Close"
                        placeholder="Amount to Swap"
                        value={amount}
                        onChange={inputEnter}
                    >    
                    </Input>
                    {" "} ETH
                    <h1/>
                    <Button
                        aria-label="Close"  
                        onPress={ETHtoDARCswap}
                    >
                        Swap ETH to DARC
                    </Button>
                    {minoutput !== undefined &&
                        <>Estimated amount : {minoutput} DARC</>
                    }
                    <h2/>
                    <h1/>
                    {explorer !== undefined &&
                        <Button
                            aria-label="Close"
                            onPress={gotoExplorer}
                        >
                        View Previous Transaction on Etherscan
                        </Button>
                    }   
                </div>
            }

        </div>
     )
}

export default Eth;