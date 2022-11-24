import { abi as UniswapV3FactoryABI } from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import Web3 from 'web3';


const UniswapV3FactoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const UNIAddress = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
const priceFetcher = async (amount, inTokenContract, outTokenAddress) => {
    const web3 = new Web3(window.ethereum);
    const factoryContract = new web3.eth.Contract(UniswapV3FactoryABI, UniswapV3FactoryAddress);

    // console.log(await web3.eth.getChainId())
    const firstPoolAddress = await factoryContract.methods.getPool(
        inTokenContract,
        UNIAddress,
        3000
    ).call();
    const secondPoolAddress = await factoryContract.methods.getPool(
        UNIAddress,
        outTokenAddress,
        3000
    ).call();
    console.log(firstPoolAddress);
    console.log(secondPoolAddress);

    const firstPoolContract = new web3.eth.Contract(IUniswapV3PoolABI, firstPoolAddress);
    const secondPoolContract = new web3.eth.Contract(IUniswapV3PoolABI, secondPoolAddress);


    const firstToken0Address = await firstPoolContract.methods.token0().call();
    const secondToken0Address = await secondPoolContract.methods.token0().call();

    console.log(firstToken0Address)
    console.log(secondToken0Address)

    const slotFirst = await firstPoolContract.methods.slot0().call();
    const slotSecond = await secondPoolContract.methods.slot0().call();
    console.log(slotFirst)
    console.log(slotSecond)

    let UNIamount;
    if (firstToken0Address === UNIAddress ) {
        UNIamount = amount * (2 ** 192 / slotFirst['sqrtPriceX96'] ** 2)* 0.99 * 0.997 // 0.99 : slippage, 0.997: fee
    } else {
        UNIamount = amount * ( slotFirst['sqrtPriceX96'] ** 2 / 2 ** 192 ) * 0.99 * 0.997 // 0.99 : slippage, 0.997: fee
    }
    console.log(UNIamount);
    if (secondToken0Address === UNIAddress ) {
        return UNIamount * (slotSecond['sqrtPriceX96'] ** 2 / 2 ** 192) * 0.99 * 0.997 // 0.99 : slippage, 0.997: fee
    } else {
        return UNIamount * (2 ** 192 / slotSecond['sqrtPriceX96'] ** 2) * 0.99 * 0.997 // 0.99 : slippage, 0.997: fee
    }
}

export {priceFetcher}