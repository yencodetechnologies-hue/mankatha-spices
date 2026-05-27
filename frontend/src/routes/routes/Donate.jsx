import React from 'react'
import Banner5 from "../../components/Donate_now/Banner5"
import DonateForm from "../../components/Donate_now/Donate_form"
import useScrollToTop from './useScrollToTop';
const Donate = () => {
  useScrollToTop();
  return (
    <div className='flex flex-col'>
        <Banner5/>
        <DonateForm/>
    </div>
  )
}

export default Donate