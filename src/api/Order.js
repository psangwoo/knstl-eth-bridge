import axios from 'axios';

const orderAPIUrl = "https://bridge-backend-api-stage.herokuapp.com/api/v1/swap/order";
const swapHandlerAddress = "0x3FAF95A83A1191CE70f82d0c7aaD52e66DB4D289";

// address of ETH should be web3.utils.toChecksumAddress(address) ed address
export const CreateOrder = async (from, to, fromAddress, toAddress, amount) => {
    const data = {
        "amount": amount,
        "from_address": fromAddress,
        "from_chain": from,
        "smart_contract": swapHandlerAddress,
        "to_address": toAddress,
        "to_chain": to,
    };
    const res = await axios({
        method: 'POST',
        url: orderAPIUrl,
        data,
    });


    console.log(res.statusText);

    // return res.status === 201;
    return {
        result: res.statusText,
        id: res.data.order_id
    }
}

export const QueryOrder = async (orderId) => {
    const { data } = await axios.get(
        orderAPIUrl.concat('/').concat(orderId)
    );
    
    return data.state;
}