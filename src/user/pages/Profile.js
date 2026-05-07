import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ShoppingBag, Heart, Package, Settings, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatMoney } from '../../utils/formatMoney';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  };

  const handleSave = () => {
    updateUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 45.99,
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2024-01-20',
      status: 'processing',
      total: 67.49,
      items: 5
    },
    {
      id: 'ORD-003',
      date: '2024-01-25',
      status: 'shipped',
      total: 32.99,
      items: 2
    }
  ];

  const mockWishlist = [
    {
      id: 1,
      name: 'Organic Fresh Apples',
      price: 4.99,
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'Fresh Organic Carrots',
      price: 3.49,
      image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=100&h=100&fit=crop'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      shipped: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Shipped' },
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <Edit2 size={16} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 text-green-600 hover:text-green-700"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h4 className="font-medium text-lg">{user?.name}</h4>
              <p className="text-gray-600">Member since January 2024</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>{user?.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span>{user?.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span>{user?.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {user?.addresses && user.addresses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Default Address</h3>
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="font-medium">{user.addresses[0].name}</p>
              <p className="text-gray-600">{user.addresses[0].address}</p>
              <p className="text-gray-600">
                {user.addresses[0].city}, {user.addresses[0].state} {user.addresses[0].zip_code}
              </p>
              <p className="text-gray-600">{user.addresses[0].country}</p>
              <p className="text-gray-600">{user.addresses[0].phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-4">
      {mockOrders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium">Order {order.id}</h4>
              <p className="text-sm text-gray-600">Placed on {order.date}</p>
            </div>
            {getStatusBadge(order.status)}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">{order.items} items</p>
              <p className="font-semibold">{formatMoney(order.total)}</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWishlistTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockWishlist.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-medium line-clamp-2">{item.name}</h4>
              <p className="text-primary-600 font-semibold">{formatMoney(item.price)}</p>
              <div className="flex gap-2 mt-2">
                <button className="text-sm bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded transition-colors">
                  Add to Cart
                </button>
                <button className="text-sm text-red-500 hover:text-red-600 px-3 py-1 rounded transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive order updates and promotions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">SMS Notifications</p>
              <p className="text-sm text-gray-600">Get text messages for important updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Security</h3>
        <div className="space-y-4">
          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Change Password
          </button>
          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Two-Factor Authentication
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'orders':
        return renderOrdersTab();
      case 'wishlist':
        return renderWishlistTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Mankatha Spices Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

