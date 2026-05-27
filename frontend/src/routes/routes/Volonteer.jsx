import React from 'react';
import Banner3 from '../../components/Career_s/Banner3';
import VolonteerForm from '../../components/Career_s/Volonteer_form';
import useScrollToTop from './useScrollToTop';

const Volonteer = () => {
  useScrollToTop();

  return (
    <div className='flex flex-col'>
      <Banner3 />
      <VolonteerForm />
    </div>
  );
};

export default Volonteer;
