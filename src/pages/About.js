import React from 'react';
import { Star, Users, Award, ShieldCheck, Heart, Leaf } from 'lucide-react';

const About = () => {
  const stats = [
    { label: "Happy Customers", value: "15k+", icon: <Users size={24} /> },
    { label: "Local Farmers", value: "200+", icon: <Leaf size={24} /> },
    { label: "Products", value: "1.2k+", icon: <Award size={24} /> },
    { label: "Cities Covered", value: "45+", icon: <ShieldCheck size={24} /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&h=600&fit=crop" 
          alt="About Us" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-6 animate-reveal">Our <span className="text-primary-400">Story</span></h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto opacity-90 leading-relaxed font-light">
            Bringing the freshest organic produce from local farms directly to your doorstep since 2012.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="reveal active">
            <span className="text-primary-600 font-bold tracking-widest uppercase mb-4 block">WHO WE ARE</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
              Driven by Passion for <br/><span className="text-gradient-primary">Mankatha Spices</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              At Mankatha Spices, we believe that everyone deserves access to healthy, organic, and sustainably sourced food. We've spent over a decade building relationships with local farmers who share our commitment to quality and environmental stewardship.
            </p>
            <div className="space-y-6">
              {[
                { title: "Pure Organic", desc: "100% certified organic products from trusted sources.", icon: <Leaf className="text-primary-600" /> },
                { title: "Support Local", desc: "Supporting over 200 local family farms and artisans.", icon: <Heart className="text-primary-600" /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-100 rounded-full blur-3xl opacity-50" />
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=1000&fit=crop" 
              alt="Farm" 
              className="rounded-[3rem] shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-xl z-20 max-w-[240px]">
              <div className="flex gap-1 text-yellow-400 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-gray-800 font-bold mb-1">"Best service ever!"</p>
              <p className="text-gray-500 text-sm">- Sarah Johnson</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-20">
        <div className="container-custom grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="text-white">
              <div className="text-primary-400 mb-4 flex justify-center">{stat.icon}</div>
              <div className="text-4xl md:text-5xl font-black mb-2">{stat.value}</div>
              <div className="text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding container-custom bg-slate-50/50 rounded-[4rem] my-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Our Core Values</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">These principles guide everything we do, from sourcing to delivery.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Quality First", desc: "If it's not good enough for our families, it's not good enough for yours." },
            { title: "Transparency", desc: "Know where your food comes from with full traceability back to the farm." },
            { title: "Sustainability", desc: "Minimizing our carbon footprint through local sourcing and plastic-free options." }
          ].map((value, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 text-center group font-outfit">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
