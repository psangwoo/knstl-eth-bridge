import Wallet from '../../page-components/Wallet';
import Knstl from '../../page-components/Knstl';
import { useState } from 'react';
export default function EthtoKnstl () {
    const [validated, setValidated] = useState(false);
    const [amount, setAmount] = useState();
    return ( 
        <div className='center'>
        {!validated ?
            <Knstl 
                amount={amount}
                setAmount={setAmount}
                setValidated={setValidated}
            />
            :
            <Wallet
               amount={amount}
            />
        } 
        </div>
    )
}