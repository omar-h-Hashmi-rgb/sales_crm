import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { leadsAPI, bookingsAPI } from '../utils/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import StatusBadge from '../components/Common/StatusBadge';
import {
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  StarIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, getTierName } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    freshLeads: 0,
    myLeads: 0,
    conversions: 0,
    recentLeads: [],
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load leads data
      const leadsResponse = await leadsAPI.getAll({ limit: 50 });
      const leads = leadsResponse.data.leads || [];
      
      // Load bookings data
      const bookingsResponse = await bookingsAPI.getAll({ limit: 10 });
      const bookings = bookingsResponse.data.bookings || [];

      // Calculate statistics
      const totalLeads = leads.length;
      const freshLeads = leads.filter(lead => lead.is_fresh).length;
      const myLeads = leads.filter(lead => lead.assigned_to_user_id === user.id).length;
      const conversions = leads.filter(lead => lead.status === 'converted').length;
      const recentLeads = leads.slice(0, 5);
      const recentBookings = bookings.slice(0, 5);

      setStats({
        totalLeads,
        freshLeads,
        myLeads,
        conversions,
        recentLeads,
        recentBookings
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      name: 'Total Leads',
      value: stats.totalLeads,
      icon: UsersIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      link: '/leads'
    },
    {
      name: 'Fresh Leads',
      value: stats.freshLeads,
      icon: StarIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      link: '/leads?fresh=true'
    },
    {
      name: user.tier_level > 2 ? 'My Leads' : 'All Leads',
      value: user.tier_level > 2 ? stats.myLeads : stats.totalLeads,
      icon: ClockIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      link: user.tier_level > 2 ? `/leads?assigned_to=${user.id}` : '/leads'
    },
    {
      name: 'Conversions',
      value: stats.conversions,
      icon: ArrowTrendingUpIcon,
      color: 'bg-primary-500',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      link: '/leads?status=converted'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {getTierName(user?.tier_level)} • Welcome to your Sales CRM dashboard
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-sm text-gray-500">Today</div>
              <div className="text-lg font-medium text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="group"
            >
              <div className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all duration-200 group-hover:scale-105`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${stat.textColor}`}>
                      {stat.name}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} rounded-lg p-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <span>View all</span>
                  <ArrowRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <UsersIcon className="h-5 w-5 mr-2 text-primary-600" />
                Recent Leads
              </h2>
              <Link
                to="/leads"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {stats.recentLeads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent leads found
              </div>
            ) : (
              stats.recentLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {lead.is_fresh && (
                        <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <PhoneIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={lead.status} />
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(lead.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
              Quick Actions
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {user.tier_level <= 2 && (
              <Link
                to="/leads/create"
                className="block w-full btn-primary text-center"
              >
                Create New Lead
              </Link>
            )}
            
            <Link
              to="/leads?status=new"
              className="block w-full btn-outline text-center"
            >
              View New Leads
            </Link>
            
            <Link
              to="/bookings"
              className="block w-full btn-outline text-center"
            >
              View Bookings
            </Link>
            
            {user.tier_level <= 2 && (
              <Link
                to="/leads?fresh=true"
                className="block w-full btn-outline text-center"
              >
                Assign Fresh Leads
              </Link>
            )}
          </div>

          {/* Recent Bookings Summary */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Bookings</h3>
            {stats.recentBookings.length === 0 ? (
              <p className="text-sm text-gray-500">No recent bookings</p>
            ) : (
              <div className="space-y-2">
                {stats.recentBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 truncate">
                        {booking.customer_name}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(booking.created_at)}
                    </div>
                  </div>
                ))}
                {stats.recentBookings.length > 3 && (
                  <Link
                    to="/bookings"
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    +{stats.recentBookings.length - 3} more
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-primary-600" />
          Performance Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversion Rate */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.totalLeads > 0 ? Math.round((stats.conversions / stats.totalLeads) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
          </div>

          {/* Fresh Lead Percentage */}
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.totalLeads > 0 ? Math.round((stats.freshLeads / stats.totalLeads) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Fresh Leads</div>
          </div>

          {/* My Assignment */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {user.tier_level > 2 ? stats.myLeads : stats.totalLeads}
            </div>
            <div className="text-sm text-gray-600">
              {user.tier_level > 2 ? 'My Assigned Leads' : 'Total Leads'}
            </div>
          </div>
        </div>
      </div>

      {/* Tips and Alerts */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200 p-6">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-primary-600 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-primary-900">
              Daily Reminders
            </h3>
            <div className="mt-2 space-y-1 text-sm text-primary-800">
              {stats.freshLeads > 0 && (
                <p>• You have {stats.freshLeads} fresh lead{stats.freshLeads !== 1 ? 's' : ''} waiting for assignment</p>
              )}
              {user.tier_level > 2 && stats.myLeads > 0 && (
                <p>• You have {stats.myLeads} lead{stats.myLeads !== 1 ? 's' : ''} assigned to you</p>
              )}
              <p>• Remember to update lead status after each customer contact</p>
              <p>• Check for new bookings that might convert existing leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;