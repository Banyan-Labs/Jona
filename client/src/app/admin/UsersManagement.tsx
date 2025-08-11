// components/admin/UsersComponent.tsx
// import React, { useState, useEffect } from 'react';
// import { Eye, Edit, Trash2, Search, Filter, Mail, Calendar, Activity, FileText } from 'lucide-react';

// // User interface definition
// export interface User {
//   id: string | number;
//   name: string;
//   email: string;
//   joined_date: string;
//   last_login: string;
//   status: 'active' | 'inactive';
//   applications_sent: number;
//   resumes_uploaded: number;
//   profile_completed: boolean;
//   subscription_type: 'free' | 'premium';
//   location: string;
// }

// type SortByOption = 'joined_date' | 'name' | 'applications_sent' | 'email';
// type FilterStatus = 'all' | 'active' | 'inactive';

// const UsersComponent: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
//   const [sortBy, setSortBy] = useState<SortByOption>('joined_date');

//   // Fetch users from Supabase
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       // Replace with your Supabase client
//       // const { data, error } = await supabase
//       //   .from('users')
//       //   .select('*')
//       //   .order('joined_date', { ascending: false });
      
//       // if (error) throw error;
//       // setUsers(data);
      
//       // Mock data for now
//       const mockUsers: User[] = [
//         {
//           id: 1,
//           name: 'John Doe',
//           email: 'john.doe@example.com',
//           joined_date: '2024-01-10',
//           last_login: '2024-01-20',
//           status: 'active',
//           applications_sent: 12,
//           resumes_uploaded: 2,
//           profile_completed: true,
//           subscription_type: 'free',
//           location: 'San Francisco, CA'
//         },
//         {
//           id: 2,
//           name: 'Jane Smith',
//           email: 'jane.smith@example.com',
//           joined_date: '2024-01-08',
//           last_login: '2024-01-19',
//           status: 'active',
//           applications_sent: 8,
//           resumes_uploaded: 1,
//           profile_completed: true,
//           subscription_type: 'premium',
//           location: 'New York, NY'
//         },
//         {
//           id: 3,
//           name: 'Bob Johnson',
//           email: 'bob.johnson@example.com',
//           joined_date: '2024-01-05',
//           last_login: '2024-01-15',
//           status: 'inactive',
//           applications_sent: 3,
//           resumes_uploaded: 1,
//           profile_completed: false,
//           subscription_type: 'free',
//           location: 'Austin, TX'
//         }
//       ];
//       setUsers(mockUsers);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async (userId: string | number): Promise<void> => {
//     if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
//       try {
//         // Replace with your Supabase client
//         // const { error } = await supabase
//         //   .from('users')
//         //   .delete()
//         //   .eq('id', userId);
        
//         // if (error) throw error;
        
//         setUsers(users.filter(user => user.id !== userId));
//       } catch (error) {
//         console.error('Error deleting user:', error);
//       }
//     }
//   };

//   const handleStatusToggle = async (userId: string | number, currentStatus: User['status']): Promise<void> => {
//     const newStatus: User['status'] = currentStatus === 'active' ? 'inactive' : 'active';
//     try {
//       // Replace with your Supabase client
//       // const { error } = await supabase
//       //   .from('users')
//       //   .update({ status: newStatus })
//       //   .eq('id', userId);
      
//       // if (error) throw error;
      
//       setUsers(users.map(user => 
//         user.id === userId ? { ...user, status: newStatus } : user
//       ));
//     } catch (error) {
//       console.error('Error updating user status:', error);
//     }
//   };

//   const sendNotificationEmail = async (userId: string | number, userEmail: string): Promise<void> => {
//     try {
//       // Implement email notification logic here
//       console.log(`Sending notification to ${userEmail}`);
//       alert(`Notification sent to ${userEmail}`);
//     } catch (error) {
//       console.error('Error sending notification:', error);
//     }
//   };

//   // Filter and sort users
//   const filteredUsers = users
//     .filter(user => {
//       const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            user.location.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
//       return matchesSearch && matchesFilter;
//     })
//     .sort((a, b) => {
//       if (sortBy === 'joined_date') {
//         return new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime();
//       }
//       if (sortBy === 'applications_sent') {
//         return b.applications_sent - a.applications_sent;
//       }
//       // For string properties (name, email)
//       const aValue = a[sortBy] as string;
//       const bValue = b[sortBy] as string;
//       return aValue.localeCompare(bValue);
//     });

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
//         <div className="flex gap-2">
//           <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
//             <Mail className="w-4 h-4" />
//             Bulk Email
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-blue-600">{users.length}</div>
//           <div className="text-sm text-gray-600">Total Users</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-green-600">
//             {users.filter(u => u.status === 'active').length}
//           </div>
//           <div className="text-sm text-gray-600">Active Users</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-purple-600">
//             {users.filter(u => u.subscription_type === 'premium').length}
//           </div>
//           <div className="text-sm text-gray-600">Premium Users</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-yellow-600">
//             {users.reduce((sum, user) => sum + user.applications_sent, 0)}
//           </div>
//           <div className="text-sm text-gray-600">Total Applications</div>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border">
//         <div className="flex flex-col sm:flex-row gap-4">
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
//           <div className="flex items-center gap-2">
//             <Filter className="h-4 w-4 text-gray-400" />
//             <select
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
//             >
//               <option value="all">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">Sort by:</span>
//             <select
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value as SortByOption)}
//             >
//               <option value="joined_date">Join Date</option>
//               <option value="name">Name</option>
//               <option value="applications_sent">Applications</option>
//               <option value="email">Email</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Users List */}
//       <div className="space-y-4">
//         {filteredUsers.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500">No users found matching your criteria.</p>
//           </div>
//         ) : (
//           filteredUsers.map((user) => (
//             <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
//                     <button
//                       onClick={() => handleStatusToggle(user.id, user.status)}
//                       className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
//                         user.status === 'active' 
//                           ? 'bg-green-100 text-green-800 hover:bg-green-200' 
//                           : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
//                       }`}
//                     >
//                       {user.status}
//                     </button>
//                     {user.subscription_type === 'premium' && (
//                       <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
//                         Premium
//                       </span>
//                     )}
//                     {!user.profile_completed && (
//                       <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
//                         Incomplete Profile
//                       </span>
//                     )}
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 flex items-center gap-1">
//                         <Mail className="w-4 h-4" />
//                         {user.email}
//                       </p>
//                       <p className="text-gray-600 flex items-center gap-1">
//                         <Calendar className="w-4 h-4" />
//                         Joined: {user.joined_date}
//                       </p>
//                       <p className="text-gray-600 flex items-center gap-1">
//                         <Activity className="w-4 h-4" />
//                         Last login: {user.last_login}
//                       </p>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <p className="text-gray-600">📍 {user.location}</p>
//                       <p className="text-blue-600 flex items-center gap-1">
//                         <FileText className="w-4 h-4" />
//                         {user.applications_sent} applications sent
//                       </p>
//                       <p className="text-purple-600">
//                         {user.resumes_uploaded} resume{user.resumes_uploaded !== 1 ? 's' : ''} uploaded
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="flex gap-2 ml-4">
//                   <button 
//                     onClick={() => sendNotificationEmail(user.id, user.email)}
//                     className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
//                     title="Send Notification"
//                   >
//                     <Mail className="w-4 h-4" />
//                   </button>
//                   <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
//                     <Eye className="w-4 h-4" />
//                   </button>
//                   <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Edit User">
//                     <Edit className="w-4 h-4" />
//                   </button>
//                   <button 
//                     onClick={() => handleDeleteUser(user.id)}
//                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                     title="Delete User"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Summary */}
//       <div className="bg-gray-50 p-4 rounded-lg">
//         <p className="text-sm text-gray-600">
//           Showing {filteredUsers.length} of {users.length} users
//         </p>
//       </div>
//     </div>
//   );
// };

// export default UsersComponent;