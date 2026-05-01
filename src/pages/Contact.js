import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe } from 'lucide-react';

const Contact = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-slate-50 py-24 border-b border-gray-100">
        <div className="container-custom text-center">
          <span className="text-primary-600 font-bold tracking-widest uppercase mb-4 block">GET IN TOUCH</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">Contact <span className="text-gradient-primary">Us</span></h1>
          <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions about our products or your order? We're here to help you live a healthier, organic life.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-8 font-outfit">Contact Information</h2>
              <div className="space-y-8">
                {[
                  { icon: <Phone />, title: "Call Us", content: "+1 (555) 123-4567", sub: "Mon-Fri, 9am - 6pm EST" },
                  { icon: <Mail />, title: "Email Us", content: "support@mankathaspices.com", sub: "We'll reply within 24 hours" },
                  { icon: <MapPin />, title: "Visit Us", content: "123 Organic Lane, Green Valley", sub: "New York, NY 10001" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-800 font-medium">{item.content}</p>
                      <p className="text-gray-500 text-sm">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl group-hover:bg-primary-500/40 transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-primary-400 mb-4">
                  <Clock size={20} />
                  <span className="text-sm font-bold tracking-widest uppercase">Business Hours</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="font-bold">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Saturday</span>
                    <span className="font-bold">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sunday</span>
                    <span className="text-red-400 font-bold uppercase tracking-tighter">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-gray-100 reveal active">
              {submitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4">Message Sent!</h3>
                  <p className="text-gray-500 text-lg mb-10">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="btn-premium px-10 py-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        value={formState.name}
                        onChange={(e) => setFormState({...formState, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        value={formState.email}
                        onChange={(e) => setFormState({...formState, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                    <input 
                      required
                      type="text" 
                      placeholder="How can we help?"
                      className="w-full px-6 py-4 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      value={formState.subject}
                      onChange={(e) => setFormState({...formState, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Your Message</label>
                    <textarea 
                      required
                      rows="5"
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-6 py-4 bg-slate-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                      value={formState.message}
                      onChange={(e) => setFormState({...formState, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full btn-premium py-5 flex items-center justify-center gap-3 text-lg"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={20} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] w-full bg-slate-100 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1600&h=400&fit=crop')] bg-cover bg-center grayscale opacity-30 group-hover:scale-105 transition-transform duration-[2s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md p-10 rounded-full shadow-2xl relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping" />
            <MapPin size={48} className="text-primary-600 relative z-10" />
          </div>
        </div>
        <div className="absolute bottom-6 right-6 glass px-6 py-2 rounded-full flex items-center gap-2">
          <Globe size={16} /> <span>Open in Google Maps</span>
        </div>
      </section>
    </div>
  );
};

export default Contact;
