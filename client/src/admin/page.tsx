// import React, { useState, useEffect } from 'react';
// import { Users, FileText, Briefcase, Search, Filter, Download, Trash2, Eye, Edit } from 'lucide-react';

// // Mock data - replace with actual Supabase calls
// const mockJobs = [
//   { id: 1, title: 'Software Engineer', company: 'Tech Corp', location: 'San Francisco', salary: '$120,000', posted_date: '2024-01-15', status: 'active' },
//   { id: 2, title: 'Data Scientist', company: 'Data Inc', location: 'New York', salary: '$110,000', posted_date: '2024-01-14', status: 'active' },
//   { id: 3, title: 'Product Manager', company: 'StartUp Co', location: 'Austin', salary: '$130,000', posted_date: '2024-01-13', status: 'inactive' },
// ];

// const mockUsers = [
//   { id: 1, name: 'John Doe', email: 'john@example.com', joined_date: '2024-01-10', status: 'active', applications: 5 },
//   { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined_date: '2024-01-08', status: 'active', applications: 3 },
//   { id: 3, name: 'Bob Johnson', email: 'bob@example.com', joined_date: '2024-01-05', status: 'inactive', applications: 1 },
// ];

// const mockResumes = [
//   { id: 1, user_id: 1, user_name: 'John Doe', filename: 'john_resume.pdf', uploaded_date: '2024-01-12', skills: ['React', 'Node.js', 'Python'], match_score: 85 },
//   { id: 2, user_id: 2, user_name: 'Jane Smith', filename: 'jane_resume.pdf', uploaded_date: '2024-01-10', skills: ['Data Analysis', 'SQL', 'Python'], match_score: 92 },
//   { id: 3, user_id: 3, user_name: 'Bob Johnson', filename: 'bob_resume.pdf', uploaded_date: '2024-01-08', skills: ['Project Management', 'Agile', 'Leadership'], match_score: 78 },
// ];

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState('jobs');
//   const [jobs, setJobs] = useState(mockJobs);
//   const [users, setUsers] = useState(mockUsers);
//   const [resumes, setResumes] = useState(mockResumes);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');

//   // Stats calculation
//   const stats = {
//     totalJobs: jobs.length,
//     activeJobs: jobs.filter(job => job.status === 'active').length,
//     totalUsers: users.length,
//     activeUsers: users.filter(user => user.status === 'active').length,
//     totalResumes: resumes.length,
//     avgMatchScore: Math.round(resumes.reduce((sum, resume) => sum + resume.match_score, 0) / resumes.length)
//   };

//   // Filter functions
//   const filteredJobs = jobs.filter(job => {
//     const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
//     return matchesSearch && matchesFilter;
//   });

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
//     return matchesSearch && matchesFilter;
//   });

//   const filteredResumes = resumes.filter(resume => {
//     const matchesSearch = resume.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          resume.filename.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesSearch;
//   });

//   const handleDeleteJob = (jobId) => {
//     setJobs(jobs.filter(job => job.id !== jobId));
//   };

//   const handleDeleteUser = (userId) => {
//     setUsers(users.filter(user => user.id !== userId));
//   };

//   const handleDeleteResume = (resumeId) => {
//     setResumes(resumes.filter(resume => resume.id !== resumeId));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//               <p className="text-gray-600">Manage jobs, users, and resumes</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <div className="p-3 rounded-full bg-blue-100 text-blue-600">
//                 <Briefcase className="w-6 h-6" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm text-gray-600">Total Jobs</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
//                 <p className="text-sm text-green-600">{stats.activeJobs} active</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <div className="p-3 rounded-full bg-green-100 text-green-600">
//                 <Users className="w-6 h-6" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm text-gray-600">Total Users</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
//                 <p className="text-sm text-green-600">{stats.activeUsers} active</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <div className="p-3 rounded-full bg-purple-100 text-purple-600">
//                 <FileText className="w-6 h-6" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm text-gray-600">Total Resumes</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalResumes}</p>
//                 <p className="text-sm text-blue-600">Avg match: {stats.avgMatchScore}%</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
//                 <Search className="w-6 h-6" />
//               </div>
//               <div className="ml-4">
//                 <p className="text-sm text-gray-600">Applications</p>
//                 <p className="text-2xl font-bold text-gray-900">{users.reduce((sum, user) => sum + user.applications, 0)}</p>
//                 <p className="text-sm text-gray-600">Total sent</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8 px-6">
//               <button
//                 onClick={() => setActiveTab('jobs')}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === 'jobs'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Jobs ({jobs.length})
//               </button>
//               <button
//                 onClick={() => setActiveTab('users')}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === 'users'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Users ({users.length})
//               </button>
//               <button
//                 onClick={() => setActiveTab('resumes')}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === 'resumes'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Resumes ({resumes.length})
//               </button>
//             </nav>
//           </div>

//           {/* Search and Filter */}
//           <div className="p-6 border-b border-gray-200">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               {activeTab !== 'resumes' && (
//                 <div className="flex items-center gap-2">
//                   <Filter className="h-4 w-4 text-gray-400" />
//                   <select
//                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                   >
//                     <option value="all">All Status</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Content */}
//           <div className="p-6">
//             {activeTab === 'jobs' && (
//               <div className="space-y-4">
//                 {filteredJobs.map((job) => (
//                   <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3">
//                           <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             job.status === 'active' 
//                               ? 'bg-green-100 text-green-800' 
//                               : 'bg-gray-100 text-gray-800'
//                           }`}>
//                             {job.status}
//                           </span>
//                         </div>
//                         <p className="text-gray-600 mt-1">{job.company} • {job.location}</p>
//                         <p className="text-blue-600 font-medium mt-1">{job.salary}</p>
//                         <p className="text-sm text-gray-500 mt-2">Posted: {job.posted_date}</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => handleDeleteJob(job.id)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {activeTab === 'users' && (
//               <div className="space-y-4">
//                 {filteredUsers.map((user) => (
//                   <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3">
//                           <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             user.status === 'active' 
//                               ? 'bg-green-100 text-green-800' 
//                               : 'bg-gray-100 text-gray-800'
//                           }`}>
//                             {user.status}
//                           </span>
//                         </div>
//                         <p className="text-gray-600 mt-1">{user.email}</p>
//                         <p className="text-sm text-gray-500 mt-2">Joined: {user.joined_date}</p>
//                         <p className="text-sm text-blue-600 mt-1">{user.applications} applications sent</p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => handleDeleteUser(user.id)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {activeTab === 'resumes' && (
//               <div className="space-y-4">
//                 {filteredResumes.map((resume) => (
//                   <div key={resume.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3">
//                           <h3 className="font-semibold text-lg text-gray-900">{resume.user_name}</h3>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             resume.match_score >= 80 
//                               ? 'bg-green-100 text-green-800' 
//                               : resume.match_score >= 60
//                               ? 'bg-yellow-100 text-yellow-800'
//                               : 'bg-red-100 text-red-800'
//                           }`}>
//                             {resume.match_score}% match
//                           </span>
//                         </div>
//                         <p className="text-gray-600 mt-1">{resume.filename}</p>
//                         <p className="text-sm text-gray-500 mt-2">Uploaded: {resume.uploaded_date}</p>
//                         <div className="mt-2">
//                           <p className="text-sm text-gray-600">Skills:</p>
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {resume.skills.map((skill, index) => (
//                               <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                                 {skill}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
//                           <Download className="w-4 h-4" />
//                         </button>
//                         <button 
//                           onClick={() => handleDeleteResume(resume.id)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;