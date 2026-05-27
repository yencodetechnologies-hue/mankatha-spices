import React from 'react'
import Banner2 from '../../components/Contact_s/Banner2'
import ContactForm from '../../components/Contact_s/Contact_form'
import useScrollToTop from './useScrollToTop';
const Contact = () => {
  useScrollToTop();
  return (
    <div>
         <Banner2/>
         <ContactForm/>
    </div>
  )
}

export default Contact;