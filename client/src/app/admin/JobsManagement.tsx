// // components/admin/JobsComponent.js
// import React, { useState, useEffect } from 'react';
// import { Eye, Edit, Trash2, Plus, Search, Filter, ExternalLink } from 'lucide-react';

// const JobsComponent = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [sortBy, setSortBy] = useState('posted_date');

//   // Fetch jobs from Supabase
//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   const fetchJobs = async () => {
//     try {
//       setLoading(true);
//       // Replace with your Supabase client
//       // const { data, error } = await supabase
//       //   .from('jobs')
//       //   .select('*')
//       //   .order('posted_date', { ascending: false });
      
//       // if (error) throw error;
//       // setJobs(data);
      
//       // Mock data for now
//       const mockJobs = [
//         {
//           id: 1,
//           title: 'Senior Software Engineer',
//           company: 'Tech Corp',
//           location: 'San Francisco, CA',
//           salary: '$120,000 - $160,000',
//           posted_date: '2024-01-15',
//           status: 'active',
//           description: 'Looking for a senior software engineer...',
//           requirements: ['5+ years experience', 'React', 'Node.js'],
//           source_url: 'https://example.com/job1',
//           scraped_from: 'Indeed'
//         },
//         {
//           id: 2,
//           title: 'Data Scientist',
//           company: 'Data Inc',
//           location: 'New York, NY',
//           salary: '$100,000 - $140,000',
//           posted_date: '2024-01-14',
//           status: 'active',
//           description: 'Data scientist position available...',
//           requirements: ['Python', 'Machine Learning', 'SQL'],
//           source_url: 'https://example.com/job2',
//           scraped_from: 'LinkedIn'
//         }
//       ];
//       setJobs(mockJobs);
//     } catch (error) {
//       console.error('Error fetching jobs:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteJob = async (jobId) => {
//     if (window.confirm('Are you sure you want to delete this job?')) {
//       try {
//         // Replace with your Supabase client
//         // const { error } = await supabase
//         //   .from('jobs')
//         //   .delete()
//         //   .eq('id', jobId);
        
//         // if (error) throw error;
        
//         setJobs(jobs.filter(job => job.id !== jobId));
//       } catch (error) {
//         console.error('Error deleting job:', error);
//       }
//     }
//   };

//   const handleStatusToggle = async (jobId, currentStatus) => {
//     const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
//     try {
//       // Replace with your Supabase client
//       // const { error } = await supabase
//       //   .from('jobs')
//       //   .update({ status: newStatus })
//       //   .eq('id', jobId);
      
//       // if (error) throw error;
      
//       setJobs(jobs.map(job => 
//         job.id === jobId ? { ...job, status: newStatus } : job
//       ));
//     } catch (error) {
//       console.error('Error updating job status:', error);
//     }
//   };

//   // Filter and sort jobs
//   const filteredJobs = jobs
//     .filter(job => {
//       const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            job.location.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
//       return matchesSearch && matchesFilter;
//     })
//     .sort((a, b) => {
//       if (sortBy === 'posted_date') {
//         return new Date(b.posted_date) - new Date(a.posted_date);
//       }
//       return a[sortBy].localeCompare(b[sortBy]);
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
//         <h2 className="text-2xl font-bold text-gray-900">Jobs Management</h2>
//         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
//           <Plus className="w-4 h-4" />
//           Add Job
//         </button>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search jobs..."
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
//               onChange={(e) => setFilterStatus(e.target.value)}
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
//               onChange={(e) => setSortBy(e.target.value)}
//             >
//               <option value="posted_date">Date Posted</option>
//               <option value="title">Job Title</option>
//               <option value="company">Company</option>
//               <option value="location">Location</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Jobs List */}
//       <div className="space-y-4">
//         {filteredJobs.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500">No jobs found matching your criteria.</p>
//           </div>
//         ) : (
//           filteredJobs.map((job) => (
//             <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
//                     <button
//                       onClick={() => handleStatusToggle(job.id, job.status)}
//                       className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
//                         job.status === 'active' 
//                           ? 'bg-green-100 text-green-800 hover:bg-green-200' 
//                           : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
//                       }`}
//                     >
//                       {job.status}
//                     </button>
//                   </div>
                  
//                   <div className="space-y-2 text-sm">
//                     <p className="text-gray-600 flex items-center gap-1">
//                       <span className="font-medium">{job.company}</span> • {job.location}
//                     </p>
//                     <p className="text-blue-600 font-medium">{job.salary}</p>
//                     <p className="text-gray-500">Posted: {job.posted_date}</p>
//                     {job.scraped_from && (
//                       <p className="text-gray-500">Source: {job.scraped_from}</p>
//                     )}
//                   </div>
                  
//                   {job.requirements && (
//                     <div className="mt-3">
//                       <p className="text-sm font-medium text-gray-700">Requirements:</p>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {job.requirements.map((req, index) => (
//                           <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                             {req}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="flex gap-2 ml-4">
//                   {job.source_url && (
//                     <button 
//                       onClick={() => window.open(job.source_url, '_blank')}
//                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                       title="View Original"
//                     >
//                       <ExternalLink className="w-4 h-4" />
//                     </button>
//                   )}
//                   <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
//                     <Eye className="w-4 h-4" />
//                   </button>
//                   <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="Edit Job">
//                     <Edit className="w-4 h-4" />
//                   </button>
//                   <button 
//                     onClick={() => handleDeleteJob(job.id)}
//                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                     title="Delete Job"
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
//           Showing {filteredJobs.length} of {jobs.length} jobs
//         </p>
//       </div>
//     </div>
//   );
// };

// export default JobsComponent;