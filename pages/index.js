import Wallet from './page-components/Wallet';
import Knstl from './page-components/Knstl';
import { useState } from 'react';

export default function Home() {
  const [validated, setValidated] = useState(false);
  return (
    <div>
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
