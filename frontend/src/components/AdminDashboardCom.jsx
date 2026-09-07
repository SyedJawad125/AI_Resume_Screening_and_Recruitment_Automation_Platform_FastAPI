import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, Clock, CheckCircle, Truck } from 'lucide-react';

const AdminPage = () => {
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [12000, 19000, 15000, 22000, 18000, 25000],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  const stats = [
    { title: 'Total Revenue', value: '$111,000', change: '+12.5%', icon: DollarSign, color: 'from-blue-500 to-blue-600', bgColor: 'from-blue-900/20 to-blue-950/30', borderColor: 'border-blue-700/30' },
    { title: 'Total Orders', value: '1,234', change: '+8.2%', icon: ShoppingCart, color: 'from-emerald-500 to-emerald-600', bgColor: 'from-emerald-900/20 to-emerald-950/30', borderColor: 'border-emerald-700/30' },
    { title: 'Customers', value: '856', change: '+15.3%', icon: Users, color: 'from-purple-500 to-purple-600', bgColor: 'from-purple-900/20 to-purple-950/30', borderColor: 'border-purple-700/30' },
    { title: 'Products', value: '342', change: '+4.1%', icon: Package, color: 'from-amber-500 to-amber-600', bgColor: 'from-amber-900/20 to-amber-950/30', borderColor: 'border-amber-700/30' },
  ];

  const recentOrders = [
    { id: '001', customer: 'John Doe', status: 'Shipped', total: '$150.00', statusColor: 'emerald', icon: Truck },
    { id: '002', customer: 'Jane Smith', status: 'Processing', total: '$200.00', statusColor: 'amber', icon: Clock },
    { id: '003', customer: 'Mike Johnson', status: 'Delivered', total: '$250.00', statusColor: 'blue', icon: CheckCircle },
    { id: '004', customer: 'Sarah Williams', status: 'Processing', total: '$180.00', statusColor: 'amber', icon: Clock },
    { id: '005', customer: 'Tom Brown', status: 'Shipped', total: '$320.00', statusColor: 'emerald', icon: Truck },
  ];

  const getStatusColor = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[color] || colors.amber;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to Admin Dashboard</h1>
          <p className="text-white/90 text-lg mb-2">
            Complete control over your E-Commerce platform
          </p>
          <p className="text-white/80 text-sm">
            Monitor sales, manage orders, and track your business growth in real-time
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border ${stat.borderColor} rounded-xl p-6 hover:border-opacity-60 transition-all duration-300 hover:transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">{stat.title}</span>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Overview Chart */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/60 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Sales Overview</h2>
              <p className="text-slate-400 text-sm">Monthly revenue trend</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/60 transition-all">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Recent Orders</h2>
              <p className="text-slate-400 text-sm">Latest customer transactions</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => {
              const StatusIcon = order.icon;
              return (
                <div
                  key={order.id}
                  className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 hover:border-slate-600/50 transition-all hover:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{order.id}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold mb-1">{order.customer}</p>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.statusColor)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{order.total}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 text-white rounded-lg transition-all font-medium">
            View All Orders
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
        <p className="text-slate-400">
          © 2024 E-Commerce Admin Dashboard • All Rights Reserved
        </p>
        <p className="text-slate-500 text-sm mt-2">
          Built with ❤️ for modern business management
        </p>
      </footer>
    </div>
  );
};

export default AdminPage;