"use client";

import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  BarChart3,
  RefreshCw,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Moon,
  Crown,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  expandable?: boolean;
  children?: { label: string; active?: boolean }[];
}

export default function Sidebar() {
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [ordersExpanded, setOrdersExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const mainNav: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    {
      icon: Package,
      label: 'Products',
      expandable: true,
      children: [],
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      active: true,
      expandable: true,
      children: [
        { label: 'All Orders', active: true },
        { label: 'Returns' },
        { label: 'Order Tracking' },
      ],
    },
    { icon: DollarSign, label: 'Sales' },
    { icon: Users, label: 'Customers' },
    { icon: BarChart3, label: 'Reports' },
  ];

  const settingsNav: NavItem[] = [
    { icon: RefreshCw, label: 'Marketplace Sync' },
    { icon: CreditCard, label: 'Payment Gateways' },
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help Center' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <span className="text-lg font-semibold text-gray-900">Prodex</span>
      </div>

      {/* Workspace selector */}
      <div className="px-4 py-4 border-b border-gray-200">
        <button className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <span className="text-sm font-medium text-gray-900">Uxerflow</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main section */}
        <div className="px-3 mb-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Main
          </div>
          <div className="space-y-1">
            {mainNav.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.label === 'Products') setProductsExpanded(!productsExpanded);
                    if (item.label === 'Orders') setOrdersExpanded(!ordersExpanded);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.expandable && (
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        (item.label === 'Orders' && ordersExpanded) ||
                        (item.label === 'Products' && productsExpanded)
                          ? 'rotate-90'
                          : ''
                      }`}
                    />
                  )}
                </button>

                {/* Sub-menu */}
                {item.children &&
                  ((item.label === 'Orders' && ordersExpanded) ||
                    (item.label === 'Products' && productsExpanded)) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.label}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            child.active
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings section */}
        <div className="px-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
            Settings
          </div>
          <div className="space-y-1">
            {settingsNav.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Dark mode toggle */}
      <div className="px-4 py-3 border-t border-gray-200">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Dark Mode</span>
          </div>
          <div
            className={`w-10 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${
                darkMode ? 'ml-5' : 'ml-1'
              }`}
            ></div>
          </div>
        </button>
      </div>

      {/* Premium upgrade card */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5" />
            <span className="text-sm font-semibold">Upgrade to Premium</span>
          </div>
          <p className="text-xs text-blue-100 mb-3">
            Your Premium Account will expire in <strong>18 days</strong>
          </p>
          <button className="w-full bg-white text-gray-900 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
