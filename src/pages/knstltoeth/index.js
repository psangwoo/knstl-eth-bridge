import Wallet from '../../page-components/Wallet';
import Knstl from '../../page-components/Knstl';
import { useState } from 'react';
export default function EthtoKnstl () {
    const [validated, setValidated] = useState(false);
    return ( 
        <div className='center'>
        {!validated ?
            <Knstl 
            setValidated={setValidated}
            />
            :
            <Wallet />
        } 
        </div>
    )
}