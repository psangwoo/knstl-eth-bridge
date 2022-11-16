
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@nextui-org/react';


export default function Home() {
  return (
    <div className='center'>
      <Link href="/knstltoeth" > 
        <Button auto>{"KNSTL -> ETH "}</Button>
      </Link>
      &emsp;
      <Link href="/ethtoknstl" > 
        <Button auto>{"ETH -> KNSTL"}</Button>
      </Link>
    </div>

  )
}
