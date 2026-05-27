import React from 'react'
 
import CareerForm from '../../components/Career_s/Career_form';
import Banner4 from '../../components/Career_s/Banner4';
import useScrollToTop from './useScrollToTop';
const Career = () => {
  useScrollToTop();
  return (
    <div className='flex flex-col'>
        <Banner4/>
        <CareerForm/>

    </div>
  )
}

export default Career;
