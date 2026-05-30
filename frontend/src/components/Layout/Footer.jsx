import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { settingsApi } from '../../api/settingsApi';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    settingsApi.getSettings().then(setSettings).catch(console.error);
  }, []);

  return (
    <>
    <footer className="bg-gray-900 text-white">
      {/* Newsletter */}
   

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 pb-20 md:pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2 lg:col-span-1 flex flex-col md:items-start text-left">
            <div className="flex items-center space-x-2 justify-start">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold">Mankatha Spices</span>
            </div>
            <p className="text-gray-300 mb-4 mt-2">
              Your trusted marketplace for the freshest organic groceries and premium produce, delivered straight to your door.
            </p>
            <div className="flex space-x-4 justify-start">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="text-left">
            <h4 className="text-lg font-semibold mb-4 text-white">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                  Payment Methods
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-gray-300 hover:text-white transition-colors cursor-pointer">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 lg:col-span-1 text-left flex flex-col md:items-start">
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
            <div className="space-y-3 w-full max-w-sm">
              <div className="flex items-center space-x-3 justify-start">
                <MapPin size={20} className="text-primary-400 shrink-0" />
                <span className="text-gray-300 text-sm">
                  {settings?.storeAddress || (
                    <>
                      123 Market Street<br />
                      New York, NY 10001
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-3 justify-start">
                <Phone size={20} className="text-primary-400 shrink-0" />
                <span className="text-gray-300 text-sm">{settings?.phone || "+1-555-0123"}</span>
              </div>
              <div className="flex items-center space-x-3 justify-start">
                <Mail size={20} className="text-primary-400 shrink-0" />
                <span className="text-gray-300 text-sm">{settings?.contactEmail || "info@neststore.com"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2024 {settings?.storeName || 'Mankatha Spices'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
      
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/94771164071"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 bg-[#25D366] text-white p-3 md:p-3.5 rounded-full shadow-lg hover:bg-[#1ebe57] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center"
        aria-label="Chat with us on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>
    </>
  );
};

export default Footer;
