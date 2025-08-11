// components/admin/ResumesComponent.js
// import React, { useState, useEffect } from 'react';
// import { Eye, Download, Trash2, Search, Filter, FileText, User, Calendar, TrendingUp } from 'lucide-react';

// const ResumesComponent = () => {
//   const [resumes, setResumes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterScore, setFilterScore] = useState('all');
//   const [sortBy, setSortBy] = useState('uploaded_date');

//   // Fetch resumes from Supabase
//   useEffect(() => {
//     fetchResumes();
//   }, []);

//   const fetchResumes = async () => {
//     try {
//       setLoading(true);
//       // Replace with your Supabase client
//       // const { data, error } = await supabase
//       //   .from('resumes')
//       //   .select(`
//       //     *,
//       //     users (
//       //       id,
//       //       name,
//       //       email
//       //     )
//       //   `)
//       //   .order('uploaded_date', { ascending: false });
      
//       // if (error) throw error;
//       // setResumes(data);
      
//       // Mock data for now
//       const mockResumes = [
//         {
//           id: 1,
//           user_id: 1,
//           user_name: 'John Doe',
//           user_email: 'john.doe@example.com',
//           filename: 'john_doe_resume.pdf',
//           original_filename: 'Software_Engineer_Resume.pdf',
//           uploaded_date: '2024-01-12',
//           file_size: 245760, // in bytes
//           file_type: 'application/pdf',
//           skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
//           experience_years: 5,
//           education: 'Bachelor of Computer Science',
//           match_score: 85,
//           applications_sent: 8,
//           file_url: '/uploads/resumes/john_doe_resume.pdf',
//           parsed_content: 'Senior Software Engineer with 5+ years of experience...'
//         },
//         {
//           id: 2,
//           user_id: 2,
//           user_name: 'Jane Smith',
//           user_email: 'jane.smith@example.com',
//           filename: 'jane_smith_resume.pdf',
//           original_filename: 'Data_Scientist_Resume.pdf',
//           uploaded_date: '2024-01-10',
//           file_size: 189440,
//           file_type: 'application/pdf',
//           skills: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'TensorFlow'],
//           experience_years: 3,
//           education: 'Master of Data Science',
//           match_score: 92,
//           applications_sent: 5,
//           file_url: '/uploads/resumes/jane_smith_resume.pdf',
//           parsed_content: 'Data Scientist with expertise in machine learning...'
//         },
//         {
//           id: 3,
//           user_id: 3,
//           user_name: 'Bob Johnson',
//           user_email: 'bob.johnson@example.com',
//           filename: 'bob_johnson_resume.pdf',
//           original_filename: 'Project_Manager_Resume.pdf',
//           uploaded_date: '2024-01-08',
//           file_size: 201728,
//           file_type: 'application/pdf',
//           skills: ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Analytics'],
//           experience_years: 7,
//           education: 'MBA',
//           match_score: 78,
//           applications_sent: 2,
//           file_url: '/uploads/resumes/bob_johnson_resume.pdf',
//           parsed_content: 'Experienced Project Manager with 7+ years...'
//         }
//       ];
//       setResumes(mockResumes);
//     } catch (error) {
//       console.error('Error fetching resumes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteResume = async (resumeId) => {
//     if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
//       try {
//         // Replace with your Supabase client
//         // const { error } = await supabase
//         //   .from('resumes')
//         //   .delete()
//         //   .eq('id', resumeId);
        
//         // if (error) throw error;
        
//         setResumes(resumes.filter(resume => resume.id !== resumeId));
//       } catch (error) {
//         console.error('Error deleting resume:', error);
//       }
//     }
//   };

//   const handleDownloadResume = async (resume) => {
//     try {
//       // In a real app, you would fetch the file from Supabase storage
//       // const { data, error } = await supabase.storage
//       //   .from('resumes')
//       //   .download(resume.file_url);
      
//       // if (error) throw error;
      
//       // For demo purposes, just show an alert
//       alert(`Downloading: ${resume.original_filename}`);
//     } catch (error) {
//       console.error('Error downloading resume:', error);
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const getScoreColor = (score) => {
//     if (score >= 80) return 'text-green-600 bg-green-100';
//     if (score >= 60) return 'text-yellow-600 bg-yellow-100';
//     return 'text-red-600 bg-red-100';
//   };

//   // Filter and sort resumes
//   const filteredResumes = resumes
//     .filter(resume => {
//       const matchesSearch = resume.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            resume.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            resume.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            resume.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
//       let matchesFilter = true;
//       if (filterScore === 'high') matchesFilter = resume.match_score >= 80;
//       else if (filterScore === 'medium') matchesFilter = resume.match_score >= 60 && resume.match_score < 80;
//       else if (filterScore === 'low') matchesFilter = resume.match_score < 60;
      
//       return matchesSearch && matchesFilter;
//     })
//     .sort((a, b) => {
//       if (sortBy === 'uploaded_date') {
//         return new Date(b.uploaded_date) - new Date(a.uploaded_date);
//       }
//       if (sortBy === 'match_score') {
//         return b.match_score - a.match_score;
//       }
//       if (sortBy === 'applications_sent') {
//         return b.applications_sent - a.applications_sent;
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
//         <h2 className="text-2xl font-bold text-gray-900">Resumes Management</h2>
//         <div className="flex gap-2">
//           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
//             <Download className="w-4 h-4" />
//             Export All
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-purple-600">{resumes.length}</div>
//           <div className="text-sm text-gray-600">Total Resumes</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-green-600">
//             {resumes.filter(r => r.match_score >= 80).length}
//           </div>
//           <div className="text-sm text-gray-600">High Match Score</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-blue-600">
//             {Math.round(resumes.reduce((sum, r) => sum + r.match_score, 0) / resumes.length)}%
//           </div>
//           <div className="text-sm text-gray-600">Avg Match Score</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-sm border">
//           <div className="text-2xl font-bold text-yellow-600">
//             {resumes.reduce((sum, r) => sum + r.applications_sent, 0)}
//           </div>
//           <div className="text-sm text-gray-600">Applications Sent</div>
//         </div>
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white p-4 rounded-lg shadow-sm border">
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search resumes, users, or skills..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <Filter className="h-4 w-4 text-gray-400" />
//             <select
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={filterScore}
//               onChange={(e) => setFilterScore(e.target.value)}
//             >
//               <option value="all">All Scores</option>
//               <option value="high">High (80%+)</option>
//               <option value="medium">Medium (60-79%)</option>
//               <option value="low">Low (< 60%)</option>
//             </select>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600">Sort by:</span>
//             <select
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//             >
//               <option value="uploaded_date">Upload Date</option>
//               <option value="match_score">Match Score</option>
//               <option value="applications_sent">Applications Sent</option>
//               <option value="user_name">User Name</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Resumes List */}
//       <div className="space-y-4">
//         {filteredResumes.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-gray-500">No resumes found matching your criteria.</p>
//           </div>
//         ) : (
//           filteredResumes.map((resume) => (
//             <div key={resume.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-3">
//                     <FileText className="w-5 h-5 text-blue-600" />
//                     <h3 className="font-semibold text-lg text-gray-900">{resume.original_filename}</h3>
//                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(resume.match_score)}`}>
//                       {resume.match_score}% match
//                     </span>
//                   </div>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                     <div className="space-y-2">
//                       <p className="text-gray-600 flex items-center gap-1">
//                         <User className="w-4 h-4" />
//                         {resume.user_name} ({resume.user_email})
//                       </p>
//                       <p className="text-gray-600 flex items-center gap-1">
//                         <Calendar className="w-4 h-4" />
//                         Uploaded: {resume.uploaded_date}
//                       </p>
//                       <p className="text-gray-600">
//                         Size: {formatFileSize(resume.file_size)}
//                       </p>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <p className="text-gray-600">
//                         Experience: {resume.experience_years} years
//                       </p>
//                       <p className="text-gray-600">
//                         Education: {resume.education}
//                       </p>
//                       <p className="text-blue-600 flex items-center gap-1">
//                         <TrendingUp className="w-4 h-4" />
//                         {resume.applications_sent} applications sent
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="mt-4">
//                     <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
//                     <div className="flex flex-wrap gap-1">
//                       {resume.skills.map((skill, index) => (
//                         <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                           {skill}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
                  
//                   {resume.parsed_content && (
//                     <div className="mt-4">
//                       <p className="text-sm font-medium text-gray-700">Preview:</p>
//                       <p className="text-sm text-gray-600 mt-1 line-clamp-2">
//                         {resume.parsed_content.substring(0, 150)}...
//                       </p>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="flex gap-2 ml-4">
//                   <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Resume">
//                     <Eye className="w-4 h-4" />
//                   </button>
//                   <button 
//                     onClick={() => handleDownloadResume(resume)}
//                     className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
//                     title="Download Resume"
//                   >
//                     <Download className="w-4 h-4" />
//                   </button>
//                   <button 
//                     onClick={() => handleDeleteResume(resume.id)}
//                     className="p-2 text-red-600