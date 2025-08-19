// import React, { useState, useEffect } from 'react';
// import { 
//   Crown, 
//   DollarSign, 
//   Users, 
//   Calendar, 
//   TrendingUp,
//   Search,
//   Filter,
//   Download,
//   Eye,
//   Edit,
//   Trash2,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   CreditCard,
//   BarChart3,
//   Plus
// } from 'lucide-react';

// // Mock data - replace with actual API calls
// const mockSubscriptionData = [
//   {
//     user_id: '1',
//     user_name: 'John Doe',
//     user_email: 'john@example.com',
//     subscription: {
//       id: 'sub_1',
//       user_id: '1',
//       plan_id: '2',
//       status: 'active',
//       billing_cycle: 'monthly',
//       current_period_start: '2024-07-17T00:00:00Z',
//       current_period_end: '2024-08-17T00:00:00Z',
//       stripe_subscription_id: 'sub_1234567890',
//       price_paid: 19.99,
//       plan: {
//         id: '2',
//         name: 'Pro',
//         price_monthly: 19.99,
//         price_yearly: 199.90,
//         features: ['500 jobs/month', '5 resumes', 'Auto-scraping']
//       }
//     },
//     total_paid: 239.88,
//     last_payment_date: '2024-08-17T00:00:00Z',
//     usage: [
//       { month_year: '2024-08', jobs_scraped: 145, applications_sent: 12, resumes_uploaded: 3 }
//     ]
//   },
//   {
//     user_id: '2',
//     user_name: 'Jane Smith',
//     user_email: 'jane@example.com',
//     subscription: {
//       id: 'sub_2',
//       user_id: '2',
//       plan_id: '3',
//       status: 'active',
//       billing_cycle: 'yearly',
//       current_period_start: '2024-01-01T00:00:00Z',
//       current_period_end: '2025-01-01T00:00:00Z',
//       stripe_subscription_id: 'sub_0987654321',
//       price_paid: 399.90,
//       plan: {
//         id: '3',
//         name: 'Premium',
//         price_monthly: 39.99,
//         price_yearly: 399.90,
//         features: ['Unlimited jobs', 'Unlimited resumes', 'Priority support']
//       }
//     },
//     total_paid: 799.80,
//     last_payment_date: '2024-01-01T00:00:00Z',
//     usage: [
//       { month_year: '2024-08', jobs_scraped: 892, applications_sent: 45, resumes_uploaded: 8 }
//     ]
//   }
// ];

// const mockSubscriptionStats = {
//   totalRevenue: 12450.75,
//   monthlyRecurringRevenue: 1250.00,
//   activeSubscriptions: 156,
//   churnRate: 3.2,
//   averageRevenuePerUser: 24.50,
//   planDistribution: {
//     free: 245,
//     pro: 134,
//     premium: 22
//   }
// };

// const subscriptionPlans = [
//   {
//     id: '1',
//     name: 'Free',
//     price_monthly: 0,
//     price_yearly: 0,
//     active: true
//   },
//   {
//     id: '2',
//     name: 'Pro',
//     price_monthly: 19.99,
//     price_yearly: 199.90,
//     active: true
//   },
//   {
//     id: '3',
//     name: 'Premium',
//     price_monthly: 39.99,
//     price_yearly: 399.90,
//     active: true
//   }
// ];

// export default function AdminSubscriptionTab() {
//   const [subscriptions, setSubscriptions] = useState(mockSubscriptionData);
//   const [stats, setStats] = useState(mockSubscriptionStats);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [planFilter, setPlanFilter] = useState('all');
//   const [loading, setLoading] = useState(false);
//   const [selectedSubscription, setSelectedSubscription] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'canceled': return 'bg-gray-100 text-gray-800';
//       case 'expired': return 'bg-red-100 text-red-800';
//       case 'past_due': return 'bg-yellow-100 text-yellow-800';
//       case 'unpaid': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'active': return <CheckCircle className="w-4 h-4" />;
//       case 'canceled': return <AlertCircle className="w-4 h-4" />;
//       case 'expired': return <Clock className="w-4 h-4" />;
//       case 'past_due': return <AlertCircle className="w-4 h-4" />;
//       case 'unpaid': return <AlertCircle className="w-4 h-4" />;
//       default: return <Clock className="w-4 h-4" />;
//     }
//   };

//   const filteredSubscriptions = subscriptions.filter(sub => {
//     const matchesSearch = sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                           sub.user_email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || sub.subscription.status === statusFilter;
//     const matchesPlan = planFilter === 'all' || sub.subscription.plan.name.toLowerCase() === planFilter;
    
//     return matchesSearch && matchesStatus && matchesPlan;
//   });

//   const handleCancelSubscription = async (subscriptionId) => {
//     if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
//     setLoading(true);
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     setSubscriptions(prev => 
//       prev.map(sub => 
//         sub.subscription.id === subscriptionId 
//           ? { ...sub, subscription: { ...sub.subscription, status: 'canceled' } }
//           : sub
//       )
//     );
//     setLoading(false);
//   };

//   const handleRefund = async (subscriptionId, amount) => {
//     if (!confirm(`Are you sure you want to refund ${formatCurrency(amount)}?`)) return;
    
//     setLoading(true);
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1500));
//     setLoading(false);
//     alert('Refund processed successfully');
//   };

//   return (
//     <div className="space-y-6">
//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
//               <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRecurringRevenue)}</p>
//             </div>
//             <div className="p-3 bg-blue-100 rounded-full">
//               <TrendingUp className="w-6 h-6 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
//             </div>
//             <div className="p-3 bg-purple-100 rounded-full">
//               <Users className="w-6 h-6 text-purple-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Churn Rate</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.churnRate}%</p>
//             </div>
//             <div className="p-3 bg-red-100 rounded-full">
//               <BarChart3 className="w-6 h-6 text-red-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Plan Distribution */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="text-center">
//             <div className="text-2xl font-bold text-gray-500">{stats.planDistribution.free}</div>
//             <div className="text-sm text-gray-600">Free Users</div>
//           </div>
//           <div className="text-center">
//             <div className="text-2xl font-bold text-blue-600">{stats.planDistribution.pro}</div>
//             <div className="text-sm text-gray-600">Pro Users</div>
//           </div>
//           <div className="text-center">
//             <div className="text-2xl font-bold text-purple-600">{stats.planDistribution.premium}</div>
//             <div className="text-sm text-gray-600">Premium Users</div>
//           </div>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search users..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="flex gap-2">
//             <select
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="canceled">Canceled</option>
//               <option value="expired">Expired</option>
//               <option value="past_due">Past Due</option>
//               <option value="unpaid">Unpaid</option>
//             </select>
//             <select
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={planFilter}
//               onChange={(e) => setPlanFilter(e.target.value)}
//             >
//               <option value="all">All Plans</option>
//               <option value="free">Free</option>
//               <option value="pro">Pro</option>
//               <option value="premium">Premium</option>
//             </select>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//           </div>
//         </div>

//         {/* Subscriptions Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-200">
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Plan</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Billing</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Next Payment</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Total Paid</th>
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredSubscriptions.map((sub) => (
//                 <tr key={sub.subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
//                   <td className="py-4 px-4">
//                     <div>
//                       <div className="font-medium text-gray-900">{sub.user_name}</div>
//                       <div className="text-sm text-gray-600">{sub.user_email}</div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center gap-2">
//                       <Crown className="w-4 h-4 text-yellow-500" />
//                       <span className="font-medium">{sub.subscription.plan.name}</span>
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       {formatCurrency(
//                         sub.subscription.billing_cycle === 'monthly' 
//                           ? sub.subscription.plan.price_monthly 
//                           : sub.subscription.plan.price_yearly
//                       )}
//                       /{sub.subscription.billing_cycle === 'monthly' ? 'mo' : 'yr'}
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.subscription.status)}`}>
//                       {getStatusIcon(sub.subscription.status)}
//                       {sub.subscription.status}
//                     </span>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="text-sm">
//                       <div className="font-medium">{sub.subscription.billing_cycle}</div>
//                       <div className="text-gray-600">
//                         {formatCurrency(sub.subscription.price_paid)}
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="text-sm text-gray-900">
//                       {new Date(sub.subscription.current_period_end).toLocaleDateString()}
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="font-medium text-gray-900">
//                       {formatCurrency(sub.total_paid)}
//                     </div>
//                   </td>
//                   <td className="py-4 px-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => {
//                           setSelectedSubscription(sub);
//                           setShowDetailsModal(true);
//                         }}
//                         className="p-1 text-gray-600 hover:text-blue-600"
//                         title="View Details"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>
//                       <button
//                         className="p-1 text-gray-600 hover:text-green-600"
//                         title="Edit Subscription"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       {sub.subscription.status === 'active' && (
//                         <button
//                           onClick={() => handleCancelSubscription(sub.subscription.id)}
//                           className="p-1 text-gray-600 hover:text-red-600"
//                           title="Cancel Subscription"
//                           disabled={loading}
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredSubscriptions.length === 0 && (
//           <div className="text-center py-8 text-gray-500">
//             No subscriptions found matching your criteria.
//           </div>
//         )}
//       </div>

//       {/* Details Modal */}
//       {showDetailsModal && selectedSubscription && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Subscription Details - {selectedSubscription.user_name}
//                 </h3>
//                 <button
//                   onClick={() => setShowDetailsModal(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">User Information</h4>
//                   <div className="space-y-2 text-sm">
//                     <div><strong>Name:</strong> {selectedSubscription.user_name}</div>
//                     <div><strong>Email:</strong> {selectedSubscription.user_email}</div>
//                     <div><strong>User ID:</strong> {selectedSubscription.user_id}</div>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Subscription Details</h4>
//                   <div className="space-y-2 text-sm">
//                     <div><strong>Plan:</strong> {selectedSubscription.subscription.plan.name}</div>
//                     <div><strong>Status:</strong> 
//                       <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedSubscription.subscription.status)}`}>
//                         {selectedSubscription.subscription.status}
//                       </span>
//                     </div>
//                     <div><strong>Billing Cycle:</strong> {selectedSubscription.subscription.billing_cycle}</div>
//                     <div><strong>Current Period:</strong> 
//                       {new Date(selectedSubscription.subscription.current_period_start).toLocaleDateString()} - 
//                       {new Date(selectedSubscription.subscription.current_period_end).toLocaleDateString()}
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Billing Information</h4>
//                   <div className="space-y-2 text-sm">
//                     <div><strong>Current Price:</strong> {formatCurrency(selectedSubscription.subscription.price_paid)}</div>
//                     <div><strong>Total Paid:</strong> {formatCurrency(selectedSubscription.total_paid)}</div>
//                     <div><strong>Last Payment:</strong> {new Date(selectedSubscription.last_payment_date).toLocaleDateString()}</div>
//                     <div><strong>Stripe ID:</strong> {selectedSubscription.subscription.stripe_subscription_id}</div>
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Usage This Month</h4>
//                   {selectedSubscription.usage.length > 0 && (
//                     <div className="space-y-2 text-sm">
//                       <div><strong>Jobs Scraped:</strong> {selectedSubscription.usage[0].jobs_scraped}</div>
//                       <div><strong>Applications Sent:</strong> {selectedSubscription.usage[0].applications_sent}</div>
//                       <div><strong>Resumes Uploaded:</strong> {selectedSubscription.usage[0].resumes_uploaded}</div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="mt-6 flex gap-3">
//                 <button
//                   onClick={() => handleRefund(selectedSubscription.subscription.id, selectedSubscription.subscription.price_paid)}
//                   className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//                   disabled={loading}
//                 >
//                   {loading ? 'Processing...' : 'Issue Refund'}
//                 </button>
//                 <button
//                   onClick={() => handleCancelSubscription(selectedSubscription.subscription.id)}
//                   className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
//                   disabled={loading}
//                 >
//                   {loading ? 'Processing...' : 'Cancel Subscription'}
//                 </button>
//                 <button
//                   onClick={() => setShowDetailsModal(false)}
//                   className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//               <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
//             </div>
//             <div className="p-3 bg-green-100 rounded-full">
//               <DollarSign className="w-6 h-6 text-green-600" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-6"></div>
// import React, { useState, useEffect } from 'react';
// import { 
//   User, 
//   Mail, 
//   Phone, 
//   MapPin, 
//   Globe, 
//   Linkedin, 
//   Github,
//   Briefcase,
//   Building2,
//   DollarSign,
//   Save,
//   FileText,
//   Camera,
//   CreditCard,
//   BarChart3,
//   Calendar,
//   Settings,
//   Crown,
//   Zap,
//   Check,
//   X,
//   Loader2,
//   AlertCircle
// } from 'lucide-react';

// // Types (from your provided code)
// type SubscriptionStatus = "active" | "canceled" | "expired" | "past_due" | "unpaid";
// type BillingCycle = "monthly" | "yearly";
// type PaymentStatus = "succeeded" | "failed" | "pending" | "canceled";

// interface SubscriptionPlan {
//   id: string;
//   name: string;
//   description?: string;
//   price_monthly?: number;
//   price_yearly?: number;
//   features: string[];
//   max_jobs_per_month?: number;
//   max_resumes?: number;
//   max_applications_per_day?: number;
//   auto_scrape_enabled: boolean;
//   priority_support: boolean;
//   active: boolean;
//   created_at?: string;
//   updated_at?: string;
// }

// interface UserSubscription {
//   id: string;
//   user_id: string;
//   plan_id: string;
//   status: SubscriptionStatus;
//   billing_cycle: BillingCycle;
//   current_period_start: string;
//   current_period_end: string;
//   stripe_subscription_id?: string;
//   stripe_customer_id?: string;
//   price_paid?: number;
//   created_at?: string;
//   updated_at?: string;
//   canceled_at?: string;
//   plan?: SubscriptionPlan;
// }

// interface UserUsage {
//   id: string;
//   user_id: string;
//   month_year: string;
//   jobs_scraped: number;
//   applications_sent: number;
//   resumes_uploaded: number;
//   created_at?: string;
//   updated_at?: string;
// }

// interface PaymentHistory {
//   id: string;
//   user_id: string;
//   subscription_id: string;
//   stripe_payment_intent_id?: string;
//   amount: number;
//   currency: string;
//   status: PaymentStatus;
//   payment_date?: string;
//   created_at?: string;
// }

// interface CurrentSubscription {
//   subscription_id: string;
//   plan_name: string;
//   status: SubscriptionStatus;
//   current_period_end: string;
//   max_jobs_per_month?: number;
//   max_resumes?: number;
//   max_applications_per_day?: number;
//   auto_scrape_enabled: boolean;
//   priority_support: boolean;
// }

// interface EnhancedUserProfile {
//   id: string;
//   email?: string;
//   full_name?: string;
//   avatar_url?: string;
//   phone?: string;
//   location?: string;
//   bio?: string;
//   website?: string;
//   linkedin_url?: string;
//   github_url?: string;
//   job_title?: string;
//   company?: string;
//   experience_level?: "entry" | "mid" | "senior" | "executive";
//   preferred_job_types?: string[];
//   preferred_locations?: string[];
//   salary_range_min?: number;
//   salary_range_max?: number;
//   created_at?: string;
//   updated_at?: string;
//   current_subscription?: CurrentSubscription;
//   usage?: UserUsage;
// }

// interface StripeCheckoutSession {
//   url: string;
//   session_id: string;
// }

// export default function ProfilePage() {
//   const [activeTab, setActiveTab] = useState('profile');
//   const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
//   const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
//   const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
//   const [usage, setUsage] = useState<UserUsage | null>(null);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
//   const [usageLimits, setUsageLimits] = useState<any>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [upgrading, setUpgrading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Get user ID from your auth context/hook - replace with your auth implementation
//   const userId = 'YOUR_USER_ID'; // Replace with actual user ID from auth

//   useEffect(() => {
//     loadInitialData();
//   }, [userId]);

//   // Supabase API functions (replace with your actual supabase client)
//   const supabase = {
//     // Mock supabase functions - replace with your actual supabase client
//     from: (table: string) => ({
//       select: (query: string) => ({
//         eq: (column: string, value: string) => ({
//           single: () => Promise.resolve({ data: null, error: null }),
//           order: (column: string, options: any) => Promise.resolve({ data: [], error: null }),
//           limit: (count: number) => Promise.resolve({ data: [], error: null })
//         }),
//         order: (column: string, options: any) => Promise.resolve({ data: [], error: null })
//       }),
//       update: (data: any) => ({
//         eq: (column: string, value: string) => ({
//           select: () => ({
//             single: () => Promise.resolve({ data: null, error: null })
//           })
//         })
//       }),
//       insert: (data: any) => ({
//         select: () => ({
//           single: () => Promise.resolve({ data: null, error: null })
//         })
//       })
//     }),
//     rpc: (functionName: string, params: any) => Promise.resolve({ data: null, error: null })
//   };

//   const loadInitialData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Mock data for demonstration - replace with actual API calls
//       const mockProfile: EnhancedUserProfile = {
//         id: userId,
//         email: 'john.doe@example.com',
//         full_name: 'John Doe',
//         avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
//         phone: '+1 (555) 123-4567',
//         location: 'San Francisco, CA',
//         bio: 'Full-stack developer passionate about building scalable web applications.',
//         website: 'https://johndoe.dev',
//         linkedin_url: 'https://linkedin.com/in/johndoe',
//         github_url: 'https://github.com/johndoe',
//         job_title: 'Senior Software Engineer',
//         company: 'Tech Corp',
//         experience_level: 'senior',
//         salary_range_min: 120000,
//         salary_range_max: 180000
//       };

//       const mockSubscription: CurrentSubscription = {
//         subscription_id: '456e7890-f12a-34b5-c678-901234567890',
//         plan_name: 'Pro',
//         status: 'active',
//         current_period_end: '2024-09-17T00:00:00Z',
//         max_jobs_per_month: 500,
//         max_resumes: 5,
//         max_applications_per_day: 25,
//         auto_scrape_enabled: true,
//         priority_support: true
//       };

//       const mockPlans: SubscriptionPlan[] = [
//         {
//           id: '1',
//           name: 'Free',
//           description: 'Basic job search features',
//           price_monthly: 0,
//           price_yearly: 0,
//           features: ['Up to 50 jobs per month', '1 resume', '5 applications per day', 'Basic support'],
//           max_jobs_per_month: 50,
//           max_resumes: 1,
//           max_applications_per_day: 5,
//           auto_scrape_enabled: false,
//           priority_support: false,
//           active: true
//         },
//         {
//           id: '2',
//           name: 'Pro',
//           description: 'Enhanced features for serious job seekers',
//           price_monthly: 19.99,
//           price_yearly: 199.90,
//           features: ['Up to 500 jobs per month', '5 resumes', '25 applications per day', 'Auto-scraping', 'Priority support'],
//           max_jobs_per_month: 500,
//           max_resumes: 5,
//           max_applications_per_day: 25,
//           auto_scrape_enabled: true,
//           priority_support: true,
//           active: true
//         },
//         {
//           id: '3',
//           name: 'Premium',
//           description: 'Full access for power users',
//           price_monthly: 39.99,
//           price_yearly: 399.90,
//           features: ['Unlimited jobs', 'Unlimited resumes', 'Unlimited applications', 'Auto-scraping', 'Priority support'],
//           max_jobs_per_month: -1,
//           max_resumes: -1,
//           max_applications_per_day: -1,
//           auto_scrape_enabled: true,
//           priority_support: true,
//           active: true
//         }
//       ];

//       const mockUsage: UserUsage = {
//         id: 'usage-id',
//         user_id: userId,
//         month_year: '2024-08',
//         jobs_scraped: 145,
//         applications_sent: 12,
//         resumes_uploaded: 3
//       };

//       const mockPayments: PaymentHistory[] = [
//         { id: '1', user_id: userId, subscription_id: 'sub1', amount: 19.99, currency: 'USD', status: 'succeeded', payment_date: '2024-08-17' },
//         { id: '2', user_id: userId, subscription_id: 'sub1', amount: 19.99, currency: 'USD', status: 'succeeded', payment_date: '2024-07-17' },
//         { id: '3', user_id: userId, subscription_id: 'sub1', amount: 19.99, currency: 'USD', status: 'succeeded', payment_date: '2024-06-17' }
//       ];

//       const mockLimits = {
//         canScrapeJobs: true,
//         canSendApplications: true,
//         canUploadResumes: true,
//         limits: {
//           max_jobs_per_month: 500,
//           max_applications_per_day: 25,
//           max_resumes: 5
//         },
//         usage: mockUsage
//       };

//       // In a real implementation, you would call your Supabase functions here
//       // Example:
//       // const { data: profileData } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
//       // const { data: subscriptionData } = await supabase.rpc('get_user_current_subscription', { user_uuid: userId });

//       setProfile(mockProfile);
//       setSubscription(mockSubscription);
//       setSubscriptionPlans(mockPlans);
//       setUsage(mockUsage);
//       setPaymentHistory(mockPayments);
//       setUsageLimits(mockLimits);
//     } catch (err) {
//       console.error('Error loading profile data:', err);
//       setError('Failed to load profile data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleProfileUpdate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!profile) return;

//     try {
//       setSaving(true);
//       setError(null);

//       // Replace with actual Supabase call
//       // Example: await supabase.from('user_profiles').update(profile).eq('id', userId);
      
//       // Mock API delay
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       setIsEditing(false);
//     } catch (err) {
//       console.error('Error updating profile:', err);
//       setError('Failed to update profile. Please try again.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleInputChange = (field: keyof EnhancedUserProfile, value: any) => {
//     setProfile(prev => prev ? {
//       ...prev,
//       [field]: value
//     } : null);
//   };

//   const handleSubscriptionUpgrade = async (planId: string) => {
//     try {
//       setUpgrading(true);
//       setError(null);

//       // Replace with actual Stripe checkout session creation
//       // Example API call to create checkout session
//       const response = await fetch("/api/stripe/create-checkout-session", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId,
//           planId,
//           billingCycle,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create checkout session");
//       }

//       const checkoutSession = await response.json();
      
//       // Redirect to Stripe Checkout
//       window.location.href = checkoutSession.url;
//     } catch (err) {
//       console.error('Error creating checkout session:', err);
//       setError('Failed to initiate subscription upgrade. Please try again.');
//       setUpgrading(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount);
//   };

//   const getProgressColor = (percentage: number) => {
//     if (percentage < 50) return 'bg-green-500';
//     if (percentage < 80) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };

//   const calculateUsagePercentage = (used: number, limit: number) => {
//     if (limit === -1) return 0; // Unlimited
//     return Math.min((used / limit) * 100, 100);
//   };

//   const getCurrentPlan = () => {
//     if (!subscription || !subscriptionPlans.length) return null;
//     return subscriptionPlans.find(plan => plan.name.toLowerCase() === subscription.plan_name.toLowerCase());
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex items-center gap-2">
//           <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//           <span className="text-gray-600">Loading profile...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error && !profile) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={loadInitialData}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
//           <p className="text-gray-600">Manage your account, subscription, and preferences</p>
//         </div>

//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="w-5 h-5 text-red-500" />
//               <span className="text-red-700">{error}</span>
//             </div>
//           </div>
//         )}

//         {/* Tab Navigation */}
//         <div className="bg-white rounded-lg shadow mb-8">
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8 px-6">
//               {[
//                 { id: 'profile', label: 'Profile', icon: User },
//                 { id: 'subscription', label: 'Subscription', icon: CreditCard },
//                 { id: 'usage', label: 'Usage & Limits', icon: BarChart3 },
//                 { id: 'billing', label: 'Billing', icon: Calendar }
//               ].map(tab => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
//                       activeTab === tab.id
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     {tab.label}
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>

//           <div className="p-6">
//             {/* Profile Tab */}
//             {activeTab === 'profile' && profile && (
//               <div className="space-y-8">
//                 {/* Basic Info */}
//                 <div className="flex items-start gap-6">
//                   <div className="relative">
//                     <img
//                       src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&size=96&background=0066cc&color=fff`}
//                       alt="Profile"
//                       className="w-24 h-24 rounded-full object-cover"
//                     />
//                     <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
//                       <Camera className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <div className="flex-1">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h2 className="text-2xl font-bold text-gray-900">{profile.full_name || 'Unnamed User'}</h2>
//                         <p className="text-gray-600">
//                           {profile.job_title && profile.company ? `${profile.job_title} at ${profile.company}` : profile.job_title || profile.company || 'No job title specified'}
//                         </p>
//                         <div className="flex items-center gap-2 mt-2">
//                           <div className="flex items-center gap-1">
//                             <Crown className="w-4 h-4 text-yellow-500" />
//                             <span className="text-sm font-medium text-gray-700">
//                               {subscription?.plan_name || 'Free'}
//                             </span>
//                           </div>
//                           {subscription && (
//                             <span className={`px-2 py-1 text-xs rounded-full ${
//                               subscription.status === 'active' 
//                                 ? 'bg-green-100 text-green-800' 
//                                 : 'bg-red-100 text-red-800'
//                             }`}>
//                               {subscription.status}
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => setIsEditing(!isEditing)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                       >
//                         {isEditing ? 'Cancel' : 'Edit Profile'}
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Profile Form */}
//                 <form onSubmit={handleProfileUpdate} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Full Name
//                       </label>
//                       <div className="relative">
//                         <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="text"
//                           value={profile.full_name || ''}
//                           onChange={(e) => handleInputChange('full_name', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Email
//                       </label>
//                       <div className="relative">
//                         <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="email"
//                           value={profile.email || ''}
//                           disabled={true}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Phone
//                       </label>
//                       <div className="relative">
//                         <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="tel"
//                           value={profile.phone || ''}
//                           onChange={(e) => handleInputChange('phone', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Location
//                       </label>
//                       <div className="relative">
//                         <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="text"
//                           value={profile.location || ''}
//                           onChange={(e) => handleInputChange('location', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Job Title
//                       </label>
//                       <div className="relative">
//                         <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="text"
//                           value={profile.job_title || ''}
//                           onChange={(e) => handleInputChange('job_title', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Company
//                       </label>
//                       <div className="relative">
//                         <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="text"
//                           value={profile.company || ''}
//                           onChange={(e) => handleInputChange('company', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Bio
//                     </label>
//                     <textarea
//                       value={profile.bio || ''}
//                       onChange={(e) => handleInputChange('bio', e.target.value)}
//                       disabled={!isEditing}
//                       rows={4}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Website
//                       </label>
//                       <div className="relative">
//                         <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="url"
//                           value={profile.website || ''}
//                           onChange={(e) => handleInputChange('website', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         LinkedIn
//                       </label>
//                       <div className="relative">
//                         <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="url"
//                           value={profile.linkedin_url || ''}
//                           onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         GitHub
//                       </label>
//                       <div className="relative">
//                         <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="url"
//                           value={profile.github_url || ''}
//                           onChange={(e) => handleInputChange('github_url', e.target.value)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Experience Level
//                       </label>
//                       <select
//                         value={profile.experience_level || ''}
//                         onChange={(e) => handleInputChange('experience_level', e.target.value)}
//                         disabled={!isEditing}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                       >
//                         <option value="">Select experience level</option>
//                         <option value="entry">Entry Level</option>
//                         <option value="mid">Mid Level</option>
//                         <option value="senior">Senior Level</option>
//                         <option value="executive">Executive</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Minimum Salary
//                       </label>
//                       <div className="relative">
//                         <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="number"
//                           value={profile.salary_range_min || ''}
//                           onChange={(e) => handleInputChange('salary_range_min', parseInt(e.target.value) || undefined)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Maximum Salary
//                       </label>
//                       <div className="relative">
//                         <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                         <input
//                           type="number"
//                           value={profile.salary_range_max || ''}
//                           onChange={(e) => handleInputChange('salary_range_max', parseInt(e.target.value) || undefined)}
//                           disabled={!isEditing}
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {isEditing && (
//                     <div className="flex justify-end gap-4">
//                       <button
//                         type="button"
//                         onClick={() => setIsEditing(false)}
//                         className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         disabled={saving}
//                         className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
//                       >
//                         {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//                         {saving ? 'Saving...' : 'Save Changes'}
//                       </button>
//                     </div>
//                   )}
//                 </form>
//               </div>
//             )}

//             {/* Subscription Tab */}
//             {activeTab === 'subscription' && (
//               <div className="space-y-8">
//                 {/* Current Subscription */}
//                 {subscription && (
//                   <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-xl font-bold text-blue-900">Current Plan: {subscription.plan_name}</h3>
//                         <p className="text-blue-700">
//                           Active until {new Date(subscription.current_period_end).toLocaleDateString()}
//                         </p>
//                         <div className="mt-2 flex items-center gap-4">
//                           {subscription.auto_scrape_enabled && (
//                             <span className="flex items-center gap-1 text-sm text-blue-700">
//                               <Zap className="w-4 h-4" />
//                               Auto-scraping enabled
//                             </span>
//                           )}
//                           {subscription.priority_support && (
//                             <span className="flex items-center gap-1 text-sm text-blue-700">
//                               <Crown className="w-4 h-4" />
//                               Priority support
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-bold text-blue-900">
//                           {subscription.plan_name === 'Free' ? 'Free' : 
//                            getCurrentPlan() ? formatCurrency(billingCycle === 'monthly' 
//                              ? (getCurrentPlan()?.price_monthly || 0) 
//                              : (getCurrentPlan()?.price_yearly || 0)) : 'N/A'}
//                         </div>
//                         <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                           Manage Subscription
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Billing Toggle */}
//                 <div className="flex items-center justify-center">
//                   <div className="bg-gray-100 rounded-lg p-1 flex">
//                     <button
//                       onClick={() => setBillingCycle('monthly')}
//                       className={`px-4 py-2 rounded-lg font-medium ${
//                         billingCycle === 'monthly'
//                           ? 'bg-white text-gray-900 shadow'
//                           : 'text-gray-600'
//                       }`}
//                     >
//                       Monthly
//                     </button>
//                     <button
//                       onClick={() => setBillingCycle('yearly')}
//                       className={`px-4 py-2 rounded-lg font-medium ${
//                         billingCycle === 'yearly'
//                           ? 'bg-white text-gray-900 shadow'
//                           : 'text-gray-600'
//                       }`}
//                     >
//                       Yearly
//                       <span className="ml-1 text-xs text-green-600">(Save 17%)</span>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Subscription Plans */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {subscriptionPlans.map((plan) => {
//                     const isCurrentPlan = subscription?.plan_name.toLowerCase() === plan.name.toLowerCase();
//                     const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
                    
//                     return (
//                       <div
//                         key={plan.id}
//                         className={`relative bg-white border-2 rounded-lg p-6 ${
//                           plan.name === 'Pro'
//                             ? 'border-blue-500 shadow-lg'
//                             : 'border-gray-200'
//                         } ${
//                           isCurrentPlan
//                             ? 'ring-2 ring-blue-500 ring-opacity-50'
//                             : ''
//                         }`}
//                       >
//                         {plan.name === 'Pro' && (
//                           <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                             <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
//                               Most Popular
//                             </span>
//                           </div>
//                         )}

//                         <div className="text-center">
//                           <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
//                           <p className="text-gray-600 mt-2">{plan.description}</p>
                          
//                           <div className="mt-4">
//                             <span className="text-3xl font-bold text-gray-900">
//                               {plan.name === 'Free' ? 'Free' : formatCurrency(price || 0)}
//                             </span>
//                             {plan.name !== 'Free' && (
//                               <span className="text-gray-600">
//                                 /{billingCycle === 'monthly' ? 'month' : 'year'}
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         <ul className="mt-6 space-y-3">
//                           {plan.features.map((feature, index) => (
//                             <li key={index} className="flex items-start gap-2">
//                               <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//                               <span className="text-gray-700 text-sm">{feature}</span>
//                             </li>
//                           ))}
//                         </ul>

//                         <div className="mt-8">
//                           {isCurrentPlan ? (
//                             <div className="w-full py-3 px-4 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
//                               Current Plan
//                             </div>
//                           ) : (
//                             <button
//                               onClick={() => handleSubscriptionUpgrade(plan.id)}
//                               disabled={upgrading}
//                               className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
//                                 plan.name === 'Free'
//                                   ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                                   : plan.name === 'Pro'
//                                   ? 'bg-blue-600 text-white hover:bg-blue-700'
//                                   : 'bg-gray-900 text-white hover:bg-gray-800'
//                               } disabled:opacity-50`}
//                             >
//                               {upgrading && <Loader2 className="w-4 h-4 animate-spin" />}
//                               {upgrading ? 'Processing...' : plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Usage Tab */}
//             {activeTab === 'usage' && usage && usageLimits && (
//               <div className="space-y-8">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Jobs Scraped */}
//                   <div className="bg-white border rounded-lg p-6">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-lg font-semibold text-gray-900">Jobs This Month</h3>

