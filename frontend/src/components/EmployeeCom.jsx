'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';
import { Search, Plus, Edit2, Trash2, Eye, Users, Briefcase, Building2, TrendingUp, UserCircle } from 'lucide-react';

const EmployeeCom = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const recordsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    receiveData();
  }, [currentPage]);

  const receiveData = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get('/api/user/v1/employee/', {
        params: {
          limit: recordsPerPage,
          offset: (currentPage - 1) * recordsPerPage,
        },
      });

      if (res && res.data && res.data.data.data) {
        setRecords(res.data.data.data);
        setTotalPages(Math.ceil(res.data.count / recordsPerPage));
        setData(res.data);
      } else {
        console.error('Unexpected response structure:', res);
        toast.error('Failed to load employees');
      }
    } catch (error) {
      console.error('Error occurred:', error);
      toast.error('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const res = await AxiosInstance.delete(`/api/user/v1/employee/?id=${id}`);
      if (res) {
        toast.success('Employee deleted successfully!');
        setCurrentPage(1);
        receiveData();
      }
    } catch (error) {
      toast.error('Error deleting employee!');
    }
  };

  const updateRecord = (item) => {
    router.push(`/updateemployeepage?id=${item.id}`);
  };

  const DetailRecord = (employeeId) => {
    router.push(`/epmloyeesdetail?EpmloyeeId=${employeeId}`);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredRecords = Array.isArray(records) ? records.filter((record) => {
    const fullName = `${record.first_name?.toLowerCase() || ''} ${record.last_name?.toLowerCase() || ''}`;
    const idMatch = record.id?.toString() === searchTerm;
    const nameMatch = fullName.includes(searchTerm);
    const positionMatch = record.position?.toLowerCase().includes(searchTerm);
    const deptMatch = record.department?.toLowerCase().includes(searchTerm);

    return idMatch || nameMatch || positionMatch || deptMatch;
  }) : [];

  const totalCount = data?.data?.count || 0;
  const uniqueDepartments = [...new Set(records.map(r => r.department))].filter(Boolean).length;
  const uniquePositions = [...new Set(records.map(r => r.position))].filter(Boolean).length;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        className="mt-16"
      />
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Employee Management
            </h1>
            <p className="text-slate-400 text-sm">Manage and organize your team members</p>
          </div>

          {permissions.create_employee && (
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
              onClick={() => router.push('/addemployeepage')}
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Employees</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalCount}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Departments</span>
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{uniqueDepartments}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Positions</span>
              <Briefcase className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{uniquePositions}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 backdrop-blur-sm border border-amber-700/30 rounded-xl p-5 hover:border-amber-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Current Page</span>
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">{currentPage} / {totalPages}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name, position, or department..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading employees...</p>
        </div>
      )}

      {/* Employee List */}
      {!loading && (
        <>
          {filteredRecords.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredRecords.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="w-7 h-7 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Name & ID */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs font-mono rounded-md border border-slate-600/30">
                                #{item.id}
                              </span>
                              <h3 className="text-xl font-bold text-white">
                                {item.first_name} {item.last_name}
                              </h3>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Briefcase className="w-4 h-4" />
                                <span>{item.position || 'N/A'}</span>
                              </div>

                              <div className="flex items-center gap-2 text-slate-400">
                                <Building2 className="w-4 h-4" />
                                <span>{item.department || 'N/A'}</span>
                              </div>

                              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all hover:scale-105"
                            onClick={() => DetailRecord(item.id)}
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>

                          {permissions.update_employee && (
                            <button
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-all hover:scale-105"
                              onClick={() => updateRecord(item)}
                              title="Edit"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}

                          {permissions.delete_employee && (
                            <button
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all hover:scale-105"
                              onClick={() => deleteRecord(item.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1 
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages 
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No employees found</h3>
              <p className="text-slate-400 mb-6">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first employee'}
              </p>
              {permissions.create_employee && !searchTerm && (
                <button
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                  onClick={() => router.push('/addemployeepage')}
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Employee
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeCom;