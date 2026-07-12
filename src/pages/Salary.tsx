// import { useState, useEffect, useCallback, useRef } from "react";
// import { 
//   Calendar, Clock, Users, Search, X, CalendarDays, 
//   User, BookOpen, ChevronLeft, ChevronRight, 
//   AlertCircle, Check, Home, LogOut, Menu, 
//   Sun, Moon, Settings, Bell, Award, DollarSign, Download, Printer,
//   ChevronDown, ChevronUp, Plus, Trash2, Edit, Save, Filter,
//   CheckCircle, XCircle, Clock as ClockIcon, UserCheck, UserX,
//   FileText, CreditCard, Receipt, TrendingUp, TrendingDown
// } from "lucide-react";
// import { toast } from "sonner";
// import axios from "axios";

// const API_BASE = "https://belmon-backend.onrender.com/api";

// // ============================================
// // TYPES
// // ============================================

// interface Teacher {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   qualification: string;
//   role: string;
// }

// interface AttendanceRecord {
//   id: string;
//   teacherId: string;
//   teacherName: string;
//   date: string;
//   checkIn: string;
//   checkOut: string;
//   status: "present" | "absent" | "late" | "excused";
//   hoursWorked: number;
//   periodsTaught: number;
//   notes?: string;
// }

// interface SalaryRecord {
//   id: string;
//   teacherId: string;
//   teacherName: string;
//   month: string;
//   year: string;
//   periodCounts: {
//     firstCycle: number;
//     secondCycle: number;
//     total: number;
//   };
//   rates: {
//     firstCycle: number;
//     secondCycle: number;
//   };
//   grossSalary: number;
//   deductions: {
//     total: number;
//     details: Array<{
//       type: string;
//       amount: number;
//       description: string;
//     }>;
//   };
//   netSalary: number;
//   attendance: {
//     present: number;
//     absent: number;
//     late: number;
//     excused: number;
//   };
//   status: "pending" | "paid" | "partially_paid";
//   paymentDate?: string;
//   paymentMethod?: "cash" | "bank_transfer" | "mobile_money" | "check";
//   transactionId?: string;
// }

// // ============================================
// // TEACHER ATTENDANCE MANAGEMENT
// // ============================================

// export function TeacherAttendancePage() {
//   const [loading, setLoading] = useState(true);
//   const [teachers, setTeachers] = useState<Teacher[]>([]);
//   const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
//   const [selectedTeacher, setSelectedTeacher] = useState<string>("");
//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split('T')[0]
//   );
//   const [selectedMonth, setSelectedMonth] = useState<string>(
//     String(new Date().getMonth() + 1).padStart(2, '0')
//   );
//   const [selectedYear, setSelectedYear] = useState<string>(
//     String(new Date().getFullYear())
//   );
//   const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [stats, setStats] = useState({
//     present: 0,
//     absent: 0,
//     late: 0,
//     excused: 0,
//     total: 0
//   });

//   // ============================================
//   // FETCH DATA
//   // ============================================

//   const fetchTeachers = useCallback(async () => {
//     try {
//       const response = await axios.get(`${API_BASE}/users?role=teacher`);
//       if (response.data.success) {
//         setTeachers(response.data.data);
//         return response.data.data;
//       }
//     } catch (error) {
//       console.error('Error fetching teachers:', error);
//       // Mock data fallback
//       const mockTeachers = [
//         { _id: 't1', name: 'John Doe', email: 'john@school.com', phone: '699123456', qualification: 'BSc Math', role: 'teacher' },
//         { _id: 't2', name: 'Jane Smith', email: 'jane@school.com', phone: '699234567', qualification: 'BEd English', role: 'teacher' },
//         { _id: 't3', name: 'Michael Brown', email: 'michael@school.com', phone: '699345678', qualification: 'PhD Physics', role: 'teacher' },
//         { _id: 't4', name: 'Sarah Wilson', email: 'sarah@school.com', phone: '699456789', qualification: 'MSc Chemistry', role: 'teacher' },
//         { _id: 't5', name: 'David Kim', email: 'david@school.com', phone: '699567890', qualification: 'BEd History', role: 'teacher' },
//       ];
//       setTeachers(mockTeachers);
//       return mockTeachers;
//     }
//   }, []);

//   const fetchAttendance = useCallback(async () => {
//     try {
//       const params = new URLSearchParams();
//       if (selectedTeacher) params.append('teacherId', selectedTeacher);
      
//       if (viewMode === 'daily' && selectedDate) {
//         params.append('date', selectedDate);
//       } else if (viewMode === 'monthly' && selectedMonth && selectedYear) {
//         params.append('month', selectedMonth);
//         params.append('year', selectedYear);
//       }

//       const response = await axios.get(`${API_BASE}/attendance?${params.toString()}`);
//       if (response.data.success) {
//         setAttendance(response.data.data);
//         calculateStats(response.data.data);
//         return response.data.data;
//       }
//     } catch (error) {
//       console.error('Error fetching attendance:', error);
//       // Generate mock attendance
//       const mockAttendance = generateMockAttendance(teachers);
//       setAttendance(mockAttendance);
//       calculateStats(mockAttendance);
//       return mockAttendance;
//     }
//   }, [selectedTeacher, selectedDate, selectedMonth, selectedYear, viewMode, teachers]);

//   const generateMockAttendance = (teachersList: Teacher[]) => {
//     const mockAttendance: AttendanceRecord[] = [];
//     const statuses: ("present" | "absent" | "late" | "excused")[] = ['present', 'present', 'present', 'late', 'absent'];
//     const now = new Date();
//     const date = now.toISOString().split('T')[0];
    
//     teachersList.forEach((teacher, i) => {
//       const status = statuses[i % statuses.length];
//       const checkIn = status === 'absent' ? '' : `${8 + Math.floor(Math.random() * 2)}:${Math.random() > 0.5 ? '00' : '30'}`;
//       const checkOut = checkIn ? `${parseInt(checkIn) + 8}:${checkIn.split(':')[1]}` : '';
      
//       mockAttendance.push({
//         id: `att_${i}`,
//         teacherId: teacher._id,
//         teacherName: teacher.name,
//         date: date,
//         checkIn: checkIn,
//         checkOut: checkOut,
//         status: status,
//         hoursWorked: status === 'present' ? 8 : status === 'late' ? 7 : 0,
//         periodsTaught: status === 'present' ? 6 : status === 'late' ? 4 : 0,
//         notes: status === 'absent' ? 'Sick leave' : status === 'late' ? 'Traffic delay' : ''
//       });
//     });
    
//     return mockAttendance;
//   };

//   const calculateStats = (attendanceList: AttendanceRecord[]) => {
//     const stats = {
//       present: attendanceList.filter(a => a.status === 'present').length,
//       absent: attendanceList.filter(a => a.status === 'absent').length,
//       late: attendanceList.filter(a => a.status === 'late').length,
//       excused: attendanceList.filter(a => a.status === 'excused').length,
//       total: attendanceList.length
//     };
//     setStats(stats);
//   };

//   // ============================================
//   // CRUD OPERATIONS
//   // ============================================

//   const handleSaveAttendance = async (record: AttendanceRecord) => {
//     try {
//       if (!record.teacherId || !record.status) {
//         toast.error('Please fill in all required fields');
//         return;
//       }

//       const isExisting = attendance.some(a => a.id === record.id);
//       let updatedAttendance;

//       if (isExisting) {
//         updatedAttendance = attendance.map(a => a.id === record.id ? record : a);
//         await axios.put(`${API_BASE}/attendance/${record.id}`, record);
//         toast.success('Attendance updated');
//       } else {
//         const newRecord = { ...record, id: `att_${Date.now()}` };
//         updatedAttendance = [...attendance, newRecord];
//         await axios.post(`${API_BASE}/attendance`, newRecord);
//         toast.success('Attendance recorded');
//       }

//       setAttendance(updatedAttendance);
//       calculateStats(updatedAttendance);
//       setShowAddModal(false);
//       setEditingRecord(null);
//     } catch (error) {
//       console.error('Error saving attendance:', error);
//       toast.error('Failed to save attendance');
//     }
//   };

//   const handleDeleteAttendance = async (id: string) => {
//     if (!window.confirm('Are you sure you want to delete this attendance record?')) return;

//     try {
//       await axios.delete(`${API_BASE}/attendance/${id}`);
//       const updatedAttendance = attendance.filter(a => a.id !== id);
//       setAttendance(updatedAttendance);
//       calculateStats(updatedAttendance);
//       toast.success('Attendance record deleted');
//     } catch (error) {
//       console.error('Error deleting attendance:', error);
//       toast.error('Failed to delete attendance');
//     }
//   };

//   // ============================================
//   // FILTERED DATA
//   // ============================================

//   const filteredAttendance = attendance.filter(record => {
//     if (!searchTerm) return true;
//     const term = searchTerm.toLowerCase();
//     return record.teacherName.toLowerCase().includes(term) ||
//            record.status.toLowerCase().includes(term);
//   });

//   // ============================================
//   // EFFECTS
//   // ============================================

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       const teachersData = await fetchTeachers();
//       await fetchAttendance();
//       setLoading(false);
//     };
//     loadData();
//   }, []);

//   useEffect(() => {
//     if (teachers.length > 0) {
//       fetchAttendance();
//     }
//   }, [selectedTeacher, selectedDate, selectedMonth, selectedYear, viewMode, teachers]);

//   // ============================================
//   // RENDER
//   // ============================================

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
//           <p className="mt-3 text-sm text-black/60 font-medium">Loading attendance...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-6 max-w-full">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 sm:gap-3">
//             <Calendar className="size-6 sm:size-8 text-brand" />
//             Teacher Attendance
//           </h1>
//           <p className="text-xs sm:text-sm text-black/60 mt-0.5 sm:mt-1">
//             {attendance.length} records • {stats.present} present • {stats.absent} absent
//           </p>
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-semibold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
//         >
//           <Plus className="size-4 sm:size-5" />
//           <span>Mark Attendance</span>
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
//         <div className="bg-green-50 rounded-2xl border border-green-200 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-green-700 font-medium uppercase tracking-wider">Present</p>
//           <p className="text-xl sm:text-2xl font-bold text-green-700 mt-0.5 sm:mt-1">{stats.present}</p>
//         </div>
//         <div className="bg-red-50 rounded-2xl border border-red-200 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-red-700 font-medium uppercase tracking-wider">Absent</p>
//           <p className="text-xl sm:text-2xl font-bold text-red-700 mt-0.5 sm:mt-1">{stats.absent}</p>
//         </div>
//         <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-yellow-700 font-medium uppercase tracking-wider">Late</p>
//           <p className="text-xl sm:text-2xl font-bold text-yellow-700 mt-0.5 sm:mt-1">{stats.late}</p>
//         </div>
//         <div className="bg-blue-50 rounded-2xl border border-blue-200 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-blue-700 font-medium uppercase tracking-wider">Excused</p>
//           <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-0.5 sm:mt-1">{stats.excused}</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-2 sm:gap-3 items-end">
//         <div className="relative flex-1 min-w-[150px]">
//           <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 size-3 sm:size-4 text-black/40" />
//           <input
//             type="text"
//             placeholder="Search teacher..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-7 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
//           />
//         </div>

//         <select
//           value={selectedTeacher}
//           onChange={(e) => setSelectedTeacher(e.target.value)}
//           className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[100px] sm:min-w-[150px]"
//         >
//           <option value="">All Teachers</option>
//           {teachers.map(t => (
//             <option key={t._id} value={t._id}>{t.name}</option>
//           ))}
//         </select>

//         <div className="flex gap-1 border border-stone-200 rounded-xl p-0.5 sm:p-1">
//           <button
//             onClick={() => setViewMode('daily')}
//             className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${viewMode === 'daily' ? 'bg-brand text-white' : 'hover:bg-stone-100'}`}
//           >
//             Daily
//           </button>
//           <button
//             onClick={() => setViewMode('monthly')}
//             className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${viewMode === 'monthly' ? 'bg-brand text-white' : 'hover:bg-stone-100'}`}
//           >
//             Monthly
//           </button>
//         </div>

//         {viewMode === 'daily' ? (
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
//           />
//         ) : (
//           <>
//             <select
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//               className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[80px] sm:min-w-[100px]"
//             >
//               {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
//                 <option key={m} value={String(m).padStart(2, '0')}>
//                   {new Date(2024, m - 1).toLocaleString('default', { month: 'short' })}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(e.target.value)}
//               className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[70px] sm:min-w-[90px]"
//             >
//               {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
//                 <option key={y} value={String(y)}>{y}</option>
//               ))}
//             </select>
//           </>
//         )}
//       </div>

//       {/* Attendance Table */}
//       <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[800px] sm:min-w-full">
//             <thead>
//               <tr className="bg-stone-50 border-b border-stone-200">
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Teacher</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Date</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Check In</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Check Out</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Status</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Hours</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Periods</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Notes</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-center text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredAttendance.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="px-4 py-8 text-center text-black/40">
//                     <CalendarDays className="size-10 sm:size-12 mx-auto text-black/20 mb-2" />
//                     <p className="text-sm">No attendance records found</p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredAttendance.map((record) => (
//                   <tr key={record.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium">{record.teacherName}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm">{new Date(record.date).toLocaleDateString()}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm">{record.checkIn || '-'}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm">{record.checkOut || '-'}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5">
//                       <span className={`badge ${record.status === 'present' ? 'badge-success' : record.status === 'late' ? 'badge-warning' : record.status === 'excused' ? 'badge-blue' : 'badge-danger'} text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1`}>
//                         {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm">{record.hoursWorked || '-'}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm">{record.periodsTaught || '-'}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm max-w-[100px] truncate">{record.notes || '-'}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-center">
//                       <div className="flex justify-center gap-1">
//                         <button
//                           onClick={() => setEditingRecord(record)}
//                           className="p-1 rounded-lg hover:bg-stone-100 text-black/60 transition"
//                         >
//                           <Edit className="size-3 sm:size-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteAttendance(record.id)}
//                           className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition"
//                         >
//                           <Trash2 className="size-3 sm:size-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-stone-200 text-xs sm:text-sm text-black/40 flex justify-between">
//           <span>Total: {filteredAttendance.length} records</span>
//           <span>Attendance Rate: {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%</span>
//         </div>
//       </div>

//       {/* Add/Edit Modal */}
//       {(showAddModal || editingRecord) && (
//         <AttendanceModal
//           initial={editingRecord || {
//             id: `att_${Date.now()}`,
//             teacherId: "",
//             teacherName: "",
//             date: new Date().toISOString().split('T')[0],
//             checkIn: "",
//             checkOut: "",
//             status: "present",
//             hoursWorked: 0,
//             periodsTaught: 0,
//             notes: ""
//           }}
//           teachers={teachers}
//           onSave={handleSaveAttendance}
//           onCancel={() => {
//             setShowAddModal(false);
//             setEditingRecord(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// // ============================================
// // ATTENDANCE MODAL
// // ============================================

// function AttendanceModal({
//   initial,
//   teachers,
//   onSave,
//   onCancel
// }: {
//   initial: AttendanceRecord;
//   teachers: Teacher[];
//   onSave: (record: AttendanceRecord) => void;
//   onCancel: () => void;
// }) {
//   const [form, setForm] = useState<AttendanceRecord>(initial);
//   const [saving, setSaving] = useState(false);

//   const set = <K extends keyof AttendanceRecord>(k: K, v: AttendanceRecord[K]) =>
//     setForm((f) => ({ ...f, [k]: v }));

//   const handleSubmit = async () => {
//     setSaving(true);
//     try {
//       await onSave(form);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onCancel}>
//       <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//         <div className="flex items-center justify-between mb-4 sm:mb-5">
//           <h3 className="font-display font-bold text-lg sm:text-xl flex items-center gap-2">
//             <UserCheck className="size-5 sm:size-6 text-brand" />
//             {initial.teacherName ? "Edit Attendance" : "Mark Attendance"}
//           </h3>
//           <button onClick={onCancel} className="text-black/40 hover:text-black/70">
//             <X className="size-4 sm:size-5" />
//           </button>
//         </div>

//         <div className="space-y-3 sm:space-y-4">
//           <div>
//             <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Teacher*</label>
//             <select
//               value={form.teacherId}
//               onChange={(e) => {
//                 const teacher = teachers.find(t => t._id === e.target.value);
//                 set("teacherId", e.target.value);
//                 set("teacherName", teacher?.name || "");
//               }}
//               className={inputCls}
//             >
//               <option value="">Select Teacher</option>
//               {teachers.map(t => (
//                 <option key={t._id} value={t._id}>{t.name}</option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Date*</label>
//             <input
//               type="date"
//               value={form.date}
//               onChange={(e) => set("date", e.target.value)}
//               className={inputCls}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Check In</label>
//               <input
//                 type="time"
//                 value={form.checkIn}
//                 onChange={(e) => set("checkIn", e.target.value)}
//                 className={inputCls}
//               />
//             </div>
//             <div>
//               <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Check Out</label>
//               <input
//                 type="time"
//                 value={form.checkOut}
//                 onChange={(e) => set("checkOut", e.target.value)}
//                 className={inputCls}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Status*</label>
//             <select
//               value={form.status}
//               onChange={(e) => set("status", e.target.value as any)}
//               className={inputCls}
//             >
//               <option value="present">Present</option>
//               <option value="absent">Absent</option>
//               <option value="late">Late</option>
//               <option value="excused">Excused</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Hours Worked</label>
//               <input
//                 type="number"
//                 value={form.hoursWorked}
//                 onChange={(e) => set("hoursWorked", parseFloat(e.target.value))}
//                 className={inputCls}
//                 min="0"
//                 step="0.5"
//               />
//             </div>
//             <div>
//               <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Periods Taught</label>
//               <input
//                 type="number"
//                 value={form.periodsTaught}
//                 onChange={(e) => set("periodsTaught", parseInt(e.target.value))}
//                 className={inputCls}
//                 min="0"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-[10px] uppercase tracking-widest font-bold text-black/50">Notes</label>
//             <input
//               type="text"
//               value={form.notes || ""}
//               onChange={(e) => set("notes", e.target.value)}
//               className={inputCls}
//               placeholder="Additional notes..."
//             />
//           </div>
//         </div>

//         <div className="flex justify-end gap-2 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-stone-100">
//           <button
//             onClick={onCancel}
//             className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold hover:bg-stone-50 transition"
//             disabled={saving}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-semibold hover:bg-brand/90 transition disabled:opacity-50 shadow-lg shadow-brand/20"
//             disabled={saving}
//           >
//             {saving ? (
//               <span className="flex items-center gap-2">
//                 <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 Saving...
//               </span>
//             ) : (
//               "Save Record"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // TEACHER SALARY MANAGEMENT
// // ============================================

// export function TeacherSalaryPage() {
//   const [loading, setLoading] = useState(true);
//   const [teachers, setTeachers] = useState<Teacher[]>([]);
//   const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
//   const [selectedTeacher, setSelectedTeacher] = useState<string>("");
//   const [selectedMonth, setSelectedMonth] = useState<string>(
//     String(new Date().getMonth() + 1).padStart(2, '0')
//   );
//   const [selectedYear, setSelectedYear] = useState<string>(
//     String(new Date().getFullYear())
//   );
//   const [selectedStatus, setSelectedStatus] = useState<string>("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [stats, setStats] = useState({
//     totalGrossSalary: 0,
//     totalNetSalary: 0,
//     totalDeductions: 0,
//     totalTeachers: 0,
//     averageSalary: 0
//   });

//   // ============================================
//   // FETCH SALARIES
//   // ============================================

//   const fetchSalaries = useCallback(async () => {
//     try {
//       const params = new URLSearchParams();
//       if (selectedTeacher) params.append('teacherId', selectedTeacher);
//       if (selectedMonth) params.append('month', selectedMonth);
//       if (selectedYear) params.append('year', selectedYear);
//       if (selectedStatus) params.append('status', selectedStatus);

//       const response = await axios.get(`${API_BASE}/salary?${params.toString()}`);
//       if (response.data.success) {
//         setSalaries(response.data.data);
//         calculateSalaryStats(response.data.data);
//         return response.data.data;
//       }
//     } catch (error) {
//       console.error('Error fetching salaries:', error);
//       // Generate mock salaries
//       const mockSalaries = generateMockSalaries(teachers);
//       setSalaries(mockSalaries);
//       calculateSalaryStats(mockSalaries);
//       return mockSalaries;
//     }
//   }, [selectedTeacher, selectedMonth, selectedYear, selectedStatus, teachers]);

//   const generateMockSalaries = (teachersList: Teacher[]) => {
//     const mockSalaries: SalaryRecord[] = [];
//     const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
//     teachersList.forEach((teacher, i) => {
//       const firstCycle = Math.floor(Math.random() * 20) + 10;
//       const secondCycle = Math.floor(Math.random() * 15) + 5;
//       const grossSalary = (firstCycle * 500) + (secondCycle * 700);
//       const absentDays = Math.floor(Math.random() * 3);
//       const deductions = absentDays * 5000;
      
//       mockSalaries.push({
//         id: `salary_${i}`,
//         teacherId: teacher._id,
//         teacherName: teacher.name,
//         month: monthNames[parseInt(selectedMonth) - 1],
//         year: selectedYear,
//         periodCounts: {
//           firstCycle: firstCycle,
//           secondCycle: secondCycle,
//           total: firstCycle + secondCycle
//         },
//         rates: {
//           firstCycle: 500,
//           secondCycle: 700
//         },
//         grossSalary: grossSalary,
//         deductions: {
//           total: deductions,
//           details: absentDays > 0 ? [{
//             type: 'absence',
//             amount: deductions,
//             description: `${absentDays} absence(s) × 5,000 FRS`
//           }] : []
//         },
//         netSalary: grossSalary - deductions,
//         attendance: {
//           present: 20 - absentDays,
//           absent: absentDays,
//           late: Math.floor(Math.random() * 2),
//           excused: Math.floor(Math.random() * 2)
//         },
//         status: i % 3 === 0 ? 'paid' : i % 3 === 1 ? 'partially_paid' : 'pending',
//         paymentDate: i % 3 === 0 ? new Date().toISOString() : undefined,
//         paymentMethod: i % 3 === 0 ? 'cash' : undefined
//       });
//     });
    
//     return mockSalaries;
//   };

//   const calculateSalaryStats = (salaryList: SalaryRecord[]) => {
//     const stats = {
//       totalGrossSalary: salaryList.reduce((sum, s) => sum + s.grossSalary, 0),
//       totalNetSalary: salaryList.reduce((sum, s) => sum + s.netSalary, 0),
//       totalDeductions: salaryList.reduce((sum, s) => sum + s.deductions.total, 0),
//       totalTeachers: salaryList.length,
//       averageSalary: salaryList.length > 0 ? salaryList.reduce((sum, s) => sum + s.netSalary, 0) / salaryList.length : 0
//     };
//     setStats(stats);
//   };

//   // ============================================
//   // PRINT SALARY
//   // ============================================

//   const printSalary = (salary: SalaryRecord) => {
//     const printContent = document.createElement('div');
//     printContent.className = 'print-content';
//     printContent.style.cssText = `
//       padding: 30px;
//       font-family: Arial, sans-serif;
//       max-width: 800px;
//       margin: 0 auto;
//       background: white;
//     `;

//     let html = `
//       <div style="text-align: center; margin-bottom: 25px;">
//         <h1 style="color: #D4AF37; font-size: 24px; margin-bottom: 5px;">BELMON BILINGUAL HIGH SCHOOL</h1>
//         <h2 style="color: #333; font-size: 18px;">Teacher Salary Statement</h2>
//         <p style="color: #666; font-size: 14px; margin-top: 5px;">${salary.teacherName}</p>
//         <p style="color: #999; font-size: 12px;">${salary.month} ${salary.year}</p>
//         <hr style="border: 1px solid #D4AF37; margin: 15px 0;">
//       </div>
//     `;

//     html += `
//       <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
//         <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
//           <p style="font-size: 11px; color: #666; margin-bottom: 2px;">Total Periods</p>
//           <p style="font-size: 20px; font-weight: bold; color: #D4AF37;">${salary.periodCounts.total}</p>
//           <p style="font-size: 10px; color: #999;">1st Cycle: ${salary.periodCounts.firstCycle} | 2nd Cycle: ${salary.periodCounts.secondCycle}</p>
//         </div>
//         <div style="background: #f5f5f5; padding: 12px; border-radius: 8px;">
//           <p style="font-size: 11px; color: #666; margin-bottom: 2px;">Status</p>
//           <p style="font-size: 16px; font-weight: bold; color: ${salary.status === 'paid' ? '#22C55E' : salary.status === 'partially_paid' ? '#EAB308' : '#EF4444'};">
//             ${salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
//           </p>
//           ${salary.paymentDate ? `<p style="font-size: 10px; color: #999;">Paid: ${new Date(salary.paymentDate).toLocaleDateString()}</p>` : ''}
//         </div>
//       </div>
//     `;

//     html += `
//       <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//         <thead>
//           <tr style="background: #D4AF37; color: white;">
//             <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Description</th>
//             <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount (FRS)</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;">1st Cycle Periods (${salary.periodCounts.firstCycle} × 500 FRS)</td>
//             <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(salary.periodCounts.firstCycle * 500).toLocaleString()}</td>
//           </tr>
//           <tr>
//             <td style="padding: 8px; border: 1px solid #ddd;">2nd Cycle Periods (${salary.periodCounts.secondCycle} × 700 FRS)</td>
//             <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(salary.periodCounts.secondCycle * 700).toLocaleString()}</td>
//           </tr>
//           <tr style="background: #f5f5f5; font-weight: bold;">
//             <td style="padding: 8px; border: 1px solid #ddd;">Gross Salary</td>
//             <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${salary.grossSalary.toLocaleString()}</td>
//           </tr>
//           ${salary.deductions.details.map(d => `
//             <tr>
//               <td style="padding: 8px; border: 1px solid #ddd;">${d.description}</td>
//               <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #EF4444;">-${d.amount.toLocaleString()}</td>
//             </tr>
//           `).join('')}
//           <tr style="background: #f5f5f5; font-weight: bold;">
//             <td style="padding: 8px; border: 1px solid #ddd;">Net Salary</td>
//             <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #D4AF37;">${salary.netSalary.toLocaleString()}</td>
//           </tr>
//         </tbody>
//       </table>
//     `;

//     html += `
//       <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
//         <div style="background: #f5f5f5; padding: 10px; text-align: center; border-radius: 8px;">
//           <p style="font-size: 10px; color: #666;">Present</p>
//           <p style="font-size: 18px; font-weight: bold; color: #22C55E;">${salary.attendance.present}</p>
//         </div>
//         <div style="background: #f5f5f5; padding: 10px; text-align: center; border-radius: 8px;">
//           <p style="font-size: 10px; color: #666;">Absent</p>
//           <p style="font-size: 18px; font-weight: bold; color: #EF4444;">${salary.attendance.absent}</p>
//         </div>
//         <div style="background: #f5f5f5; padding: 10px; text-align: center; border-radius: 8px;">
//           <p style="font-size: 10px; color: #666;">Late</p>
//           <p style="font-size: 18px; font-weight: bold; color: #EAB308;">${salary.attendance.late}</p>
//         </div>
//       </div>
//     `;

//     html += `
//       <div style="margin-top: 20px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #ddd; padding-top: 15px;">
//         <p>Generated on ${new Date().toLocaleString()} • BELMON BILINGUAL HIGH SCHOOL</p>
//         <div style="display: flex; justify-content: space-between; margin-top: 10px;">
//           <div style="text-align: center;">
//             <div style="border-bottom: 1px solid #333; width: 150px; margin: 0 auto;"></div>
//             <p style="font-size: 10px; margin-top: 5px;">Accountant Signature</p>
//           </div>
//           <div style="text-align: center;">
//             <div style="border-bottom: 1px solid #333; width: 150px; margin: 0 auto;"></div>
//             <p style="font-size: 10px; margin-top: 5px;">Teacher Signature</p>
//           </div>
//         </div>
//       </div>
//     `;

//     printContent.innerHTML = html;

//     const style = document.createElement('style');
//     style.textContent = `
//       @media print {
//         body * { visibility: hidden; }
//         .print-content, .print-content * { visibility: visible; }
//         .print-content { position: absolute; left: 0; top: 0; width: 100%; background: white; }
//         @page { margin: 10mm; }
//       }
//     `;
//     document.head.appendChild(style);
//     document.body.appendChild(printContent);

//     setTimeout(() => {
//       window.print();
//       document.body.removeChild(printContent);
//       document.head.removeChild(style);
//       toast.success('Salary statement printed');
//     }, 500);
//   };

//   // ============================================
//   // EFFECTS
//   // ============================================

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const teachersRes = await axios.get(`${API_BASE}/users?role=teacher`);
//         if (teachersRes.data.success) {
//           setTeachers(teachersRes.data.data);
//         }
//       } catch (error) {
//         console.error('Error fetching teachers:', error);
//         const mockTeachers = [
//           { _id: 't1', name: 'John Doe', email: 'john@school.com', phone: '699123456', qualification: 'BSc Math', role: 'teacher' },
//           { _id: 't2', name: 'Jane Smith', email: 'jane@school.com', phone: '699234567', qualification: 'BEd English', role: 'teacher' },
//           { _id: 't3', name: 'Michael Brown', email: 'michael@school.com', phone: '699345678', qualification: 'PhD Physics', role: 'teacher' },
//           { _id: 't4', name: 'Sarah Wilson', email: 'sarah@school.com', phone: '699456789', qualification: 'MSc Chemistry', role: 'teacher' },
//           { _id: 't5', name: 'David Kim', email: 'david@school.com', phone: '699567890', qualification: 'BEd History', role: 'teacher' },
//         ];
//         setTeachers(mockTeachers);
//       }
//       await fetchSalaries();
//       setLoading(false);
//     };
//     loadData();
//   }, []);

//   useEffect(() => {
//     if (teachers.length > 0) {
//       fetchSalaries();
//     }
//   }, [selectedTeacher, selectedMonth, selectedYear, selectedStatus, teachers]);

//   // ============================================
//   // RENDER
//   // ============================================

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
//           <p className="mt-3 text-sm text-black/60 font-medium">Loading salaries...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-6 max-w-full">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2 sm:gap-3">
//             <DollarSign className="size-6 sm:size-8 text-brand" />
//             Teacher Salaries
//           </h1>
//           <p className="text-xs sm:text-sm text-black/60 mt-0.5 sm:mt-1">
//             {salaries.length} records • {stats.totalNetSalary.toLocaleString()} FRS total paid
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => {
//               const params = new URLSearchParams();
//               params.append('month', selectedMonth);
//               params.append('year', selectedYear);
//               // Trigger salary generation
//               axios.post(`${API_BASE}/salary/generate`, {
//                 month: parseInt(selectedMonth),
//                 year: selectedYear
//               }).then(() => {
//                 toast.success('Salaries generated');
//                 fetchSalaries();
//               }).catch(() => {
//                 toast.error('Failed to generate salaries');
//               });
//             }}
//             className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition"
//           >
//             <RefreshCw className="size-4" />
//             Generate
//           </button>
//           <button
//             onClick={() => {
//               // Export to PDF all salaries
//               salaries.forEach(s => printSalary(s));
//             }}
//             className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-green-600 text-white text-xs sm:text-sm font-semibold hover:bg-green-700 transition"
//           >
//             <Printer className="size-4" />
//             Print All
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
//         <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-black/40 font-medium uppercase tracking-wider">Total Gross</p>
//           <p className="text-lg sm:text-xl font-bold text-brand mt-0.5 sm:mt-1 truncate">{stats.totalGrossSalary.toLocaleString()} FRS</p>
//         </div>
//         <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-black/40 font-medium uppercase tracking-wider">Total Net</p>
//           <p className="text-lg sm:text-xl font-bold text-green-600 mt-0.5 sm:mt-1 truncate">{stats.totalNetSalary.toLocaleString()} FRS</p>
//         </div>
//         <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-black/40 font-medium uppercase tracking-wider">Deductions</p>
//           <p className="text-lg sm:text-xl font-bold text-red-500 mt-0.5 sm:mt-1 truncate">{stats.totalDeductions.toLocaleString()} FRS</p>
//         </div>
//         <div className="bg-white rounded-2xl border border-brand/20 bg-brand/5 p-3 sm:p-4">
//           <p className="text-[10px] sm:text-xs text-brand/60 font-medium uppercase tracking-wider">Average Salary</p>
//           <p className="text-lg sm:text-xl font-bold text-brand mt-0.5 sm:mt-1 truncate">{Math.round(stats.averageSalary).toLocaleString()} FRS</p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-2 sm:gap-3 items-end">
//         <div className="relative flex-1 min-w-[150px]">
//           <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 size-3 sm:size-4 text-black/40" />
//           <input
//             type="text"
//             placeholder="Search teacher..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-7 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
//           />
//         </div>

//         <select
//           value={selectedTeacher}
//           onChange={(e) => setSelectedTeacher(e.target.value)}
//           className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[100px] sm:min-w-[150px]"
//         >
//           <option value="">All Teachers</option>
//           {teachers.map(t => (
//             <option key={t._id} value={t._id}>{t.name}</option>
//           ))}
//         </select>

//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[80px] sm:min-w-[100px]"
//         >
//           {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
//             <option key={m} value={String(m).padStart(2, '0')}>
//               {new Date(2024, m - 1).toLocaleString('default', { month: 'short' })}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//           className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[70px] sm:min-w-[90px]"
//         >
//           {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
//             <option key={y} value={String(y)}>{y}</option>
//           ))}
//         </select>

//         <select
//           value={selectedStatus}
//           onChange={(e) => setSelectedStatus(e.target.value)}
//           className="px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[80px] sm:min-w-[100px]"
//         >
//           <option value="">All Status</option>
//           <option value="pending">Pending</option>
//           <option value="paid">Paid</option>
//           <option value="partially_paid">Partial</option>
//         </select>
//       </div>

//       {/* Salary Table */}
//       <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[900px] sm:min-w-full">
//             <thead>
//               <tr className="bg-stone-50 border-b border-stone-200">
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Teacher</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Month</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Periods</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Gross</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Deductions</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Net</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Status</th>
//                 <th className="px-2 sm:px-3 py-2 sm:py-2.5 text-center text-[10px] sm:text-xs font-bold text-black/50 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {salaries.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="px-4 py-8 text-center text-black/40">
//                     <DollarSign className="size-10 sm:size-12 mx-auto text-black/20 mb-2" />
//                     <p className="text-sm">No salary records found</p>
//                   </td>
//                 </tr>
//               ) : (
//                 salaries.map((salary) => (
//                   <tr key={salary.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium">{salary.teacherName}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm">{salary.month} {salary.year}</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm">
//                       {salary.periodCounts.total}
//                       <span className="text-[8px] sm:text-[10px] text-black/40 block">
//                         1st: {salary.periodCounts.firstCycle} | 2nd: {salary.periodCounts.secondCycle}
//                       </span>
//                     </td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium">{salary.grossSalary.toLocaleString()} FRS</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm text-red-500">{salary.deductions.total.toLocaleString()} FRS</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-brand">{salary.netSalary.toLocaleString()} FRS</td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5">
//                       <span className={`badge ${salary.status === 'paid' ? 'badge-success' : salary.status === 'partially_paid' ? 'badge-warning' : 'badge-danger'} text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1`}>
//                         {salary.status.charAt(0).toUpperCase() + salary.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-center">
//                       <div className="flex justify-center gap-1">
//                         <button
//                           onClick={() => printSalary(salary)}
//                           className="p-1 rounded-lg hover:bg-stone-100 text-black/60 transition"
//                           title="Print Salary"
//                         >
//                           <Printer className="size-3 sm:size-4" />
//                         </button>
//                         {salary.status !== 'paid' && (
//                           <button
//                             onClick={async () => {
//                               try {
//                                 await axios.put(`${API_BASE}/salary/pay/${salary.id}`, {
//                                   paymentMethod: 'cash'
//                                 });
//                                 toast.success('Salary marked as paid');
//                                 fetchSalaries();
//                               } catch (error) {
//                                 toast.error('Failed to update salary');
//                               }
//                             }}
//                             className="p-1 rounded-lg hover:bg-green-50 text-green-500 transition"
//                             title="Mark as Paid"
//                           >
//                             <Check className="size-3 sm:size-4" />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-stone-200 text-xs sm:text-sm text-black/40 flex justify-between">
//           <span>Total: {salaries.length} records</span>
//           <span>Total Net: {stats.totalNetSalary.toLocaleString()} FRS</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // HELPER COMPONENTS
// // ============================================

// const inputCls = "w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition";

// // Add to your main component exports
// export function TeacherManagementPages() {
//   return {
//     TeacherAttendancePage,
//     TeacherSalaryPage
//   };
// }
































import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import {
  Calendar, Clock, Users, Plus, Pencil, Trash2, Search, X,
  CalendarDays, User, BookOpen, Printer, Download,
  Filter, ChevronLeft, ChevronRight, Grid, List,
  AlertCircle, Copy, RefreshCw, Upload, FileSpreadsheet,
  Eye, EyeOff, LayoutGrid, Table as TableIcon, User as UserIcon,
  School, ChevronDown, FileDown, Settings
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import html2canvas from "html2canvas-pro";

const API_BASE = "https://belmon-backend.onrender.com/api";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const CALENDAR_TIME_SLOTS = Array.from({ length: 8 }, (_, i) => `${8 + i}:00`);
const CYCLE_RATES = { first: 500, second: 700 } as const;

// Real period schedule used only for the PDF grid layout
const PDF_SCHEDULE = [
  { type: "period" as const, label: "1", start: "08:15", end: "09:00" },
  { type: "period" as const, label: "2", start: "09:00", end: "09:45" },
  { type: "period" as const, label: "3", start: "09:45", end: "10:30" },
  { type: "break" as const, label: "BREAK TIME", start: "10:30", end: "11:00" },
  { type: "period" as const, label: "4", start: "11:00", end: "12:00" },
];
const PDF_GRID_DAYS = DAYS.slice(0, 5);

// ============================================
// TYPES
// ============================================

interface TimetableEntry {
  id: string;
  _id?: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  day: string;
  startTime: string;
  endTime: string;
  periodNumber: number;
  cycle: "first" | "second";
  ratePerPeriod: number;
  room?: string;
  academicYear: string;
  isActive: boolean;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  subjectIds: string[];
  classIds: string[];
}

interface Class {
  _id: string;
  className: string;
  department?: string;
  cycle?: string;
  displayName?: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  department?: string;
}

interface TimetableStats {
  totalPeriods: number;
  totalTeachers: number;
  totalClasses: number;
  totalPotential: number;
  firstCyclePeriods: number;
  secondCyclePeriods: number;
}

interface PdfGridCell {
  subjectName: string;
  teacherName: string;
  room?: string;
}

interface PdfGridRow {
  day: string;
  period: string;
  duration: string;
  isBreak: boolean;
  cells: Record<string, PdfGridCell | null>;
}

// ============================================
// TIME SANITIZATION HELPERS
// ============================================

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function isValidTimeString(t: any): t is string {
  return typeof t === "string" && TIME_RE.test(t);
}

function addOneHourCapped(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const endHour = Math.min(h + 1, 23);
  return `${String(endHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function sanitizeTimes(startTimeRaw: any, endTimeRaw: any): { startTime: string; endTime: string } {
  const startTime = isValidTimeString(startTimeRaw) ? startTimeRaw : "08:00";
  const endCandidate = isValidTimeString(endTimeRaw) ? endTimeRaw : null;
  const isPlaceholder = endCandidate === null || endCandidate === "00:00";

  const endTime = isPlaceholder ? addOneHourCapped(startTime) : endCandidate!;
  return { startTime, endTime };
}

function sanitizeEntry(entry: TimetableEntry): TimetableEntry {
  const { startTime, endTime } = sanitizeTimes(entry.startTime, entry.endTime);
  return { ...entry, startTime, endTime };
}

// ============================================
// MODULE-LEVEL HELPERS
// ============================================

function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(`timetable_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

function loadFromLocalStorage(key: string) {
  try {
    const data = localStorage.getItem(`timetable_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
}

function mapApiEntry(entry: any): TimetableEntry {
  const teacherObj = entry.teacherId || {};
  const classObj = entry.classId || {};
  const subjectObj = entry.subjectId || {};

  const { startTime, endTime } = sanitizeTimes(entry.startTime, entry.endTime);

  return {
    id: entry._id || entry.id || `temp_${Date.now()}`,
    _id: entry._id || entry.id,
    teacherId: teacherObj._id || entry.teacherId || "",
    teacherName: teacherObj.name || entry.teacherName || "Unknown",
    classId: classObj._id || entry.classId || "",
    className: classObj.className || entry.className || "Unknown",
    subjectId: subjectObj._id || entry.subjectId || "",
    subjectName: subjectObj.name || entry.subjectName || "Unknown",
    subjectCode: subjectObj.code || entry.subjectCode || "",
    day: entry.day || "",
    startTime,
    endTime,
    periodNumber: entry.periodNumber || 1,
    cycle: entry.cycle || "first",
    ratePerPeriod: entry.ratePerPeriod || CYCLE_RATES.first,
    room: entry.room || "",
    academicYear: entry.academicYear || "2026-2027",
    isActive: entry.isActive !== undefined ? entry.isActive : true,
  };
}

function mapForApi(entry: TimetableEntry) {
  const { startTime, endTime } = sanitizeTimes(entry.startTime, entry.endTime);
  return {
    teacherId: entry.teacherId,
    classId: entry.classId,
    subjectId: entry.subjectId,
    day: entry.day,
    startTime,
    endTime,
    periodNumber: entry.periodNumber || 1,
    cycle: entry.cycle || 'first',
    ratePerPeriod: entry.ratePerPeriod || CYCLE_RATES[entry.cycle || 'first'],
    room: entry.room || '',
    academicYear: entry.academicYear || '2026-2027',
    isActive: entry.isActive !== undefined ? entry.isActive : true,
  };
}

function mergeBulkApiResults(
  baseEntries: TimetableEntry[],
  submittedEntries: TimetableEntry[],
  apiEntries?: any[]
): TimetableEntry[] {
  if (!apiEntries) return [...baseEntries, ...submittedEntries];

  const merged = [...baseEntries];
  submittedEntries.forEach((entry, index) => {
    const apiEntry = apiEntries[index];
    merged.push(apiEntry?._id ? { ...entry, _id: apiEntry._id, id: apiEntry._id } : entry);
  });
  return merged;
}

function calculateStats(entries: TimetableEntry[]): TimetableStats {
  const firstCycle = entries.filter((e) => e.cycle === "first").length;
  const secondCycle = entries.filter((e) => e.cycle === "second").length;
  const totalPotential = entries.reduce((sum, e) => sum + e.ratePerPeriod, 0);

  return {
    totalPeriods: entries.length,
    totalTeachers: new Set(entries.map((e) => e.teacherId)).size,
    totalClasses: new Set(entries.map((e) => e.classId)).size,
    totalPotential,
    firstCyclePeriods: firstCycle,
    secondCyclePeriods: secondCycle,
  };
}

function csvField(value: string | number | undefined | null): string {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function normalizeColor(color: string): string {
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return color;
    ctx.fillStyle = color;
    return ctx.fillStyle;
  } catch {
    return color;
  }
}

function flattenUnsupportedColors(root: HTMLElement) {
  const props = ["color", "backgroundColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor"] as const;
  const all = root.querySelectorAll<HTMLElement>("*");
  [root, ...Array.from(all)].forEach((el) => {
    const computed = window.getComputedStyle(el);
    props.forEach((prop) => {
      const value = computed[prop];
      if (value && (value.includes("oklch") || value.includes("lab(") || value.includes("color("))) {
        el.style[prop] = normalizeColor(value);
      }
    });
  });
}

// ============================================
// MULTI-SUBJECT HELPERS
// ============================================

function groupEntriesByClassAndTime(entries: TimetableEntry[]): Map<string, TimetableEntry[]> {
  const grouped = new Map<string, TimetableEntry[]>();

  entries.forEach(entry => {
    const key = `${entry.classId}|${entry.day}|${entry.startTime}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(entry);
  });

  return grouped;
}

function combineMultiSubjectEntries(entries: TimetableEntry[]): TimetableEntry[] {
  const grouped = groupEntriesByClassAndTime(entries);
  const combined: TimetableEntry[] = [];

  grouped.forEach((group) => {
    if (group.length === 1) {
      combined.push(group[0]);
    } else {
      const first = group[0];
      const subjectNames = group.map(e => e.subjectName).join('/');
      const teacherNames = group.map(e => e.teacherName).join('/');
      const subjectCodes = group.map(e => e.subjectCode || '').filter(Boolean).join('/');

      combined.push({
        ...first,
        subjectName: subjectNames,
        subjectCode: subjectCodes || undefined,
        teacherName: teacherNames,
        room: group.every(e => e.room === group[0].room) ? group[0].room : group.map(e => e.room || '?').join('/'),
        id: first.id,
        _id: first._id,
      });
    }
  });

  return combined;
}

function buildPdfGrid(entries: TimetableEntry[], classList: Class[]): PdfGridRow[] {
  const combinedEntries = combineMultiSubjectEntries(entries);
  const classNames = classList.map((c) => c.className);

  const index = new Map<string, TimetableEntry>();
  combinedEntries.forEach((e) => {
    index.set(`${e.day}|${e.startTime}|${e.className}`, e);
  });

  const rows: PdfGridRow[] = [];
  PDF_GRID_DAYS.forEach((day) => {
    PDF_SCHEDULE.forEach((slot) => {
      if (slot.type === "break") {
        rows.push({ day, period: "", duration: `${slot.start} - ${slot.end}`, isBreak: true, cells: {} });
        return;
      }
      const cells: Record<string, PdfGridCell | null> = {};
      classNames.forEach((cls) => {
        const entry = index.get(`${day}|${slot.start}|${cls}`);
        cells[cls] = entry ? {
          subjectName: entry.subjectName,
          teacherName: entry.teacherName,
          room: entry.room
        } : null;
      });
      rows.push({ day, period: slot.label, duration: `${slot.start} - ${slot.end}`, isBreak: false, cells });
    });
  });

  return rows;
}

function buildPaginatedPdfGrids(entries: TimetableEntry[], classList: Class[]): PdfGridRow[][] {
  const combinedEntries = combineMultiSubjectEntries(entries);
  const uniqueClassNames = new Set<string>();
  combinedEntries.forEach(e => {
    const className = e.className || 'Unknown';
    uniqueClassNames.add(className);
  });

  const classNames = Array.from(uniqueClassNames).sort();

  const index = new Map<string, TimetableEntry>();
  combinedEntries.forEach((e) => {
    const key = `${e.day}|${e.startTime}|${e.className}`;
    index.set(key, e);
  });

  const pageGroups = [
    { days: ["Monday", "Tuesday", "Wednesday"], label: "Mon-Wed" },
    { days: ["Thursday", "Friday"], label: "Thu-Fri" },
  ];

  return pageGroups.map((group) => {
    const rows: PdfGridRow[] = [];
    group.days.forEach((day) => {
      PDF_SCHEDULE.forEach((slot) => {
        if (slot.type === "break") {
          rows.push({
            day,
            period: "",
            duration: `${slot.start} - ${slot.end}`,
            isBreak: true,
            cells: {}
          });
          return;
        }
        const cells: Record<string, PdfGridCell | null> = {};
        classNames.forEach((cls) => {
          const entry = index.get(`${day}|${slot.start}|${cls}`);
          cells[cls] = entry ? {
            subjectName: entry.subjectName,
            teacherName: entry.teacherName,
            room: entry.room
          } : null;
        });
        rows.push({
          day,
          period: slot.label,
          duration: `${slot.start} - ${slot.end}`,
          isBreak: false,
          cells
        });
      });
    });
    return rows;
  });
}

function buildMatrixTimetable(entries: TimetableEntry[], classList: Class[]): any {
  const combinedEntries = combineMultiSubjectEntries(entries);
  const uniqueClasses = dedupeClassesByName(classList);
  const timeSlots = ["08:15", "09:00", "09:45", "10:30", "11:00"];
  const labels = ["1", "2", "3", "BREAK", "4"];
  const isBreak = [false, false, false, true, false];

  const matrix: any = {};
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  days.forEach(day => {
    matrix[day] = {};
    timeSlots.forEach((time, idx) => {
      matrix[day][time] = {
        label: labels[idx],
        isBreak: isBreak[idx],
        entries: []
      };
    });
  });

  combinedEntries.forEach(entry => {
    if (matrix[entry.day] && matrix[entry.day][entry.startTime]) {
      matrix[entry.day][entry.startTime].entries.push(entry);
    }
  });

  return { matrix, days, timeSlots, labels, isBreak, classes: uniqueClasses };
}

function dedupeClassesByName(classList: Class[]): Class[] {
  const seen = new Set<string>();
  const result: Class[] = [];
  classList.forEach((c) => {
    const fullName = c.department ? `${c.className} ${c.department}` : c.className;
    const key = fullName.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        ...c,
        displayName: fullName
      });
    }
  });
  return result;
}

function generateMockData() {
  const mockTeachers: Teacher[] = [
    { _id: "t1", name: "John Doe", email: "john@school.com", phone: "699123456", qualification: "BSc Math", subjectIds: ["s1"], classIds: ["c1"] },
    { _id: "t2", name: "Jane Smith", email: "jane@school.com", phone: "699234567", qualification: "BEd English", subjectIds: ["s2"], classIds: ["c2"] },
    { _id: "t3", name: "Michael Brown", email: "michael@school.com", phone: "699345678", qualification: "PhD Physics", subjectIds: ["s3"], classIds: ["c3"] },
    { _id: "t4", name: "Sarah Wilson", email: "sarah@school.com", phone: "699456789", qualification: "MSc Chemistry", subjectIds: ["s4"], classIds: ["c1"] },
    { _id: "t5", name: "David Kim", email: "david@school.com", phone: "699567890", qualification: "BEd History", subjectIds: ["s5"], classIds: ["c3"] },
  ];

  const mockClasses: Class[] = [
    { _id: "c1", className: "Form 4", department: "Science A", cycle: "First Cycle" },
    { _id: "c2", className: "Form 5", department: "Science A", cycle: "Second Cycle" },
    { _id: "c3", className: "Form 3", department: "Arts", cycle: "First Cycle" },
    { _id: "c4", className: "Form 4", department: "Commercial", cycle: "First Cycle" },
    { _id: "c5", className: "Form 5", department: "Arts", cycle: "Second Cycle" },
  ];

  const mockSubjects: Subject[] = [
    { _id: "s1", name: "Mathematics", code: "MATH" },
    { _id: "s2", name: "English", code: "ENG" },
    { _id: "s3", name: "Physics", code: "PHY" },
    { _id: "s4", name: "Chemistry", code: "CHEM" },
    { _id: "s5", name: "History", code: "HIST" },
    { _id: "s6", name: "Geography", code: "GEOG" },
  ];

  const mockEntries: TimetableEntry[] = [];
  const periods = [1, 2, 3, 4, 5, 6];
  const days = DAYS.slice(0, 5);

  mockTeachers.forEach((teacher, ti) => {
    days.forEach((day, di) => {
      periods.forEach((period, pi) => {
        if (Math.random() > 0.5) {
          const cls = mockClasses[(ti + di + pi) % mockClasses.length];
          const subj = mockSubjects[(ti + di) % mockSubjects.length];
          const cycle: "first" | "second" = ti % 2 === 0 ? "first" : "second";
          mockEntries.push({
            id: `entry_${ti}_${di}_${pi}`,
            teacherId: teacher._id,
            teacherName: teacher.name,
            classId: cls._id,
            className: cls.className,
            subjectId: subj._id,
            subjectName: subj.name,
            subjectCode: subj.code,
            day,
            startTime: `${8 + period}:00`,
            endTime: `${8 + period + 1}:00`,
            periodNumber: period,
            cycle,
            ratePerPeriod: CYCLE_RATES[cycle],
            room: `Room ${Math.floor(Math.random() * 10) + 1}`,
            academicYear: "2026-2027",
            isActive: true,
          });
        }
      });
    });
  });

  return { teachers: mockTeachers, classes: mockClasses, subjects: mockSubjects, entries: mockEntries };
}

// ============================================
// STAT CARD COMPONENT
// ============================================

const StatCard = memo(function StatCard({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4">
      <p className="text-xs text-black/40 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueClassName}`}>{value}</p>
    </div>
  );
});

const CycleBadge = memo(function CycleBadge({ cycle }: { cycle: "first" | "second" }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-bold ${cycle === "first" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
        }`}
    >
      {cycle === "first" ? "1st Cycle" : "2nd Cycle"}
    </span>
  );
});

// ============================================
// MAIN TIMETABLE ADMIN PAGE
// ============================================

export function TimetableAdminPage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "calendar">("table");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedCycle, setSelectedCycle] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [stats, setStats] = useState<TimetableStats>({
    totalPeriods: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalPotential: 0,
    firstCyclePeriods: 0,
    secondCyclePeriods: 0,
  });
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterTeacher, setFilterTeacher] = useState<string>("");

  // PDF Options
  const [pdfOptions, setPdfOptions] = useState<{
    showTeacherNames: boolean;
    showRoomNumbers: boolean;
    includeHeader: boolean;
    format: "matrix" | "standard" | "paginated";
  }>({
    showTeacherNames: true,
    showRoomNumbers: true,
    includeHeader: true,
    format: "matrix",
  });

  const currentYear = new Date().getFullYear();
  const academicYear = "2026-2027";

  // ============================================
  // FETCH DATA
  // ============================================

  const applyMockDataFallback = useCallback(() => {
    const mockData = generateMockData();
    setEntries(mockData.entries);
    setTeachers(mockData.teachers);
    setClasses(mockData.classes);
    setSubjects(mockData.subjects);
    setStats(calculateStats(mockData.entries));
    saveToLocalStorage("entries", mockData.entries);
    saveToLocalStorage("teachers", mockData.teachers);
    saveToLocalStorage("classes", mockData.classes);
    saveToLocalStorage("subjects", mockData.subjects);
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);

      const cachedEntries = loadFromLocalStorage("entries");
      const cachedTeachers = loadFromLocalStorage("teachers");
      const cachedClasses = loadFromLocalStorage("classes");
      const cachedSubjects = loadFromLocalStorage("subjects");
      const hasCache = cachedEntries && cachedEntries.length > 0;

      if (hasCache) {
        const sanitizedCached: TimetableEntry[] = (cachedEntries as TimetableEntry[]).map(sanitizeEntry);
        setEntries(sanitizedCached);
        setTeachers(cachedTeachers || []);
        setClasses(cachedClasses || []);
        setSubjects(cachedSubjects || []);
        setStats(calculateStats(sanitizedCached));
        saveToLocalStorage("entries", sanitizedCached);
      }

      try {
        const [timetableRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
          axios.get(`${API_BASE}/timetable`).catch(() => ({ data: { success: false } })),
          axios.get(`${API_BASE}/users?role=teacher`).catch(() => ({ data: { success: false } })),
          axios.get(`${API_BASE}/classes`).catch(() => ({ data: { success: false } })),
          axios.get(`${API_BASE}/subjects`).catch(() => ({ data: { success: false } })),
        ]);

        const apiSuccess =
          timetableRes.data.success || teachersRes.data.success || classesRes.data.success || subjectsRes.data.success;

        if (apiSuccess) {
          setIsOnline(true);
          setApiError(null);

          if (timetableRes.data.success && timetableRes.data.data.length > 0) {
            const mappedEntries = timetableRes.data.data.map(mapApiEntry);
            setEntries(mappedEntries);
            saveToLocalStorage("entries", mappedEntries);
            setStats(calculateStats(mappedEntries));
          }
          if (teachersRes.data.success && teachersRes.data.data.length > 0) {
            setTeachers(teachersRes.data.data);
            saveToLocalStorage("teachers", teachersRes.data.data);
          }
          if (classesRes.data.success && classesRes.data.data.length > 0) {
            setClasses(classesRes.data.data);
            saveToLocalStorage("classes", classesRes.data.data);
          }
          if (subjectsRes.data.success && subjectsRes.data.data.length > 0) {
            setSubjects(subjectsRes.data.data);
            saveToLocalStorage("subjects", subjectsRes.data.data);
          }
        } else if (!hasCache) {
          applyMockDataFallback();
          toast.info("Using demo data");
        } else {
          toast.info("Using cached data");
        }
      } catch (apiErr) {
        console.error("API Error:", apiErr);
        setApiError("API server error. Using local data.");
        setIsOnline(false);
        if (!hasCache) {
          applyMockDataFallback();
          toast.info("Using demo data (offline mode)");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [applyMockDataFallback]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ============================================
  // FILTERED DATA
  // ============================================

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.teacherName.toLowerCase().includes(term) ||
          e.className.toLowerCase().includes(term) ||
          e.subjectName.toLowerCase().includes(term) ||
          (e.subjectCode && e.subjectCode.toLowerCase().includes(term))
      );
    }
    if (selectedTeacher) filtered = filtered.filter((e) => e.teacherId === selectedTeacher);
    if (selectedClass) filtered = filtered.filter((e) => e.classId === selectedClass);
    if (selectedDay) filtered = filtered.filter((e) => e.day === selectedDay);
    if (selectedCycle) filtered = filtered.filter((e) => e.cycle === selectedCycle);

    if (filterClass) filtered = filtered.filter((e) => e.classId === filterClass);
    if (filterTeacher) filtered = filtered.filter((e) => e.teacherId === filterTeacher);

    return filtered;
  }, [entries, searchTerm, selectedTeacher, selectedClass, selectedDay, selectedCycle, filterClass, filterTeacher]);

  const hasActiveFilters = Boolean(selectedTeacher || selectedClass || selectedDay || selectedCycle || searchTerm || filterClass || filterTeacher);

  const clearFilters = useCallback(() => {
    setSelectedTeacher("");
    setSelectedClass("");
    setSelectedDay("");
    setSelectedCycle("");
    setSearchTerm("");
    setFilterClass("");
    setFilterTeacher("");
  }, []);

  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, Class>();
    classes.forEach(c => {
      const fullName = c.department ? `${c.className} ${c.department}` : c.className;
      if (!classMap.has(fullName)) {
        classMap.set(fullName, c);
      }
    });
    return Array.from(classMap.values());
  }, [classes]);

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const syncToAPI = useCallback(async (method: string, url: string, data?: any) => {
    try {
      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("API sync failed:", error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        const errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;

        if (errorMsg.includes('already assigned to')) {
          throw new Error(errorMsg);
        }

        throw new Error(errorMsg);
      } else if (error.request) {
        console.error('No response received');
        throw new Error('No response from server');
      } else {
        throw new Error(error.message);
      }
    }
  }, []);

  const handleSaveEntry = useCallback(
    async (entry: TimetableEntry) => {
      if (isSaving) return;

      if (!entry.teacherId || !entry.classId || !entry.subjectId) {
        toast.error("Please fill in all required fields");
        return;
      }

      const { startTime, endTime } = sanitizeTimes(entry.startTime, entry.endTime);
      const sanitizedEntry: TimetableEntry = { ...entry, startTime, endTime };

      if (sanitizedEntry.startTime >= sanitizedEntry.endTime) {
        toast.error("Start time must be before end time");
        return;
      }

      setIsSaving(true);
      try {
        const isNew = !sanitizedEntry._id &&
          (!sanitizedEntry.id || sanitizedEntry.id.startsWith('entry_'));

        const isExisting = !isNew && entries.some((e) => {
          const matchById =
            e.id === sanitizedEntry.id ||
            e._id === sanitizedEntry.id ||
            e.id === sanitizedEntry._id ||
            e._id === sanitizedEntry._id ||
            (e._id && sanitizedEntry._id && e._id.toString() === sanitizedEntry._id.toString());
          return matchById;
        });

        const apiData = mapForApi(sanitizedEntry);
        let updatedEntries: TimetableEntry[];

        if (isExisting) {
          const existingEntry = entries.find((e) => {
            const matchById =
              e.id === sanitizedEntry.id ||
              e._id === sanitizedEntry.id ||
              e.id === sanitizedEntry._id ||
              e._id === sanitizedEntry._id ||
              (e._id && sanitizedEntry._id && e._id.toString() === sanitizedEntry._id.toString());
            return matchById;
          });

          const apiId = existingEntry?._id || existingEntry?.id || sanitizedEntry._id || sanitizedEntry.id;

          if (!apiId) {
            toast.error("Invalid entry ID");
            setIsSaving(false);
            return;
          }

          const result = await syncToAPI("PUT", `${API_BASE}/timetable/${apiId}`, apiData);

          if (result?.success) {
            updatedEntries = entries.map((e) => {
              const isMatching =
                e.id === sanitizedEntry.id ||
                e._id === sanitizedEntry.id ||
                e.id === sanitizedEntry._id ||
                e._id === sanitizedEntry._id ||
                (e._id && sanitizedEntry._id && e._id.toString() === sanitizedEntry._id.toString());

              if (isMatching) {
                return {
                  ...sanitizedEntry,
                  _id: e._id || sanitizedEntry._id,
                  id: e.id || sanitizedEntry.id
                };
              }
              return e;
            });

            setEntries(updatedEntries);
            setStats(calculateStats(updatedEntries));
            saveToLocalStorage("entries", updatedEntries);
            toast.success("Timetable entry updated");
          } else {
            throw new Error(result?.message || "Failed to update");
          }
        } else {
          try {
            const teacherConflict = entries.find((e) =>
              e.teacherId === sanitizedEntry.teacherId &&
              e.day === sanitizedEntry.day &&
              e.startTime === sanitizedEntry.startTime &&
              e.academicYear === sanitizedEntry.academicYear &&
              e.id !== sanitizedEntry.id &&
              e._id !== sanitizedEntry._id
            );

            if (teacherConflict) {
              const conflictTeacher = teachers.find(t => t._id === teacherConflict.teacherId);
              toast.error(
                `⚠️ Teacher "${conflictTeacher?.name || teacherConflict.teacherName}" is already assigned to ${teacherConflict.className} at this time on ${sanitizedEntry.day}.\n\n` +
                `To add multiple subjects to the same class at the same time, use a different teacher.`
              );
              setIsSaving(false);
              return;
            }

            const result = await syncToAPI("POST", `${API_BASE}/timetable`, apiData);

            if (result?.success && result?.data) {
              const savedData = result.data;
              const savedEntry = {
                ...sanitizedEntry,
                id: savedData._id || savedData.id || `entry_${Date.now()}`,
                _id: savedData._id || savedData.id,
                ratePerPeriod: savedData.ratePerPeriod || sanitizedEntry.ratePerPeriod,
              };

              updatedEntries = [...entries, savedEntry];
              setEntries(updatedEntries);
              setStats(calculateStats(updatedEntries));
              saveToLocalStorage("entries", updatedEntries);
              toast.success("Timetable entry added successfully");
            } else {
              throw new Error(result?.message || "Failed to create entry");
            }
          } catch (error: any) {
            if (error.message?.includes("already has a period") ||
              error.message?.includes("already assigned")) {
              toast.error(
                `⚠️ ${error.message}\n\n` +
                `This teacher already has a period at this time.\n` +
                `To add multiple subjects to the same class at the same time,\n` +
                `please use a different teacher for each subject.`
              );
            } else {
              throw error;
            }
            setIsSaving(false);
            return;
          }
        }

        setEditingEntry(null);
        setShowAddModal(false);
      } catch (error) {
        console.error("Error saving timetable:", error);
        toast.error(error instanceof Error ? error.message : "Failed to save entry");
        if (error.message?.includes('already assigned to')) {
          toast.error(`⚠️ ${error.message}`);
        } else {
          toast.error(error instanceof Error ? error.message : "Failed to save entry");
        }
        setIsSaving(false);
        return;
      } finally {
        setIsSaving(false);
      }
    },
    [entries, isSaving, syncToAPI, teachers]
  );

  const handleDeleteEntry = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this timetable entry?")) return;
      if (isSaving) return;

      setIsSaving(true);
      try {
        const entryToDelete = entries.find((e) => e.id === id || e._id === id);
        const apiId = entryToDelete?._id || entryToDelete?.id || id;

        if (apiId) {
          const result = await syncToAPI("DELETE", `${API_BASE}/timetable/${apiId}`);
          if (result) {
            toast.success("Timetable entry deleted");
          } else {
            toast.warning("Entry may have already been deleted");
          }
        }

        const updatedEntries = entries.filter((e) => e.id !== id && e._id !== id);
        setEntries(updatedEntries);
        setStats(calculateStats(updatedEntries));
        saveToLocalStorage("entries", updatedEntries);

        if (editingEntry && (editingEntry.id === id || editingEntry._id === id)) {
          setEditingEntry(null);
        }
      } catch (error) {
        console.error("Error deleting timetable:", error);
        const updatedEntries = entries.filter((e) => e.id !== id && e._id !== id);
        setEntries(updatedEntries);
        setStats(calculateStats(updatedEntries));
        saveToLocalStorage("entries", updatedEntries);
        toast.warning("Deleted locally (API sync failed)");
      } finally {
        setIsSaving(false);
      }
    },
    [entries, isSaving, syncToAPI, editingEntry]
  );

  const handleBulkAdd = useCallback(
    async (newEntries: TimetableEntry[]) => {
      if (isSaving) return;

      const sanitizedNewEntries = newEntries.map(sanitizeEntry);
      const validEntries = sanitizedNewEntries.filter((e) => e.teacherId && e.classId && e.subjectId);
      if (validEntries.length === 0) {
        toast.error("No valid entries to add");
        return;
      }

      setIsSaving(true);
      try {
        const apiData = validEntries.map(mapForApi);
        const result = await syncToAPI("POST", `${API_BASE}/timetable/bulk`, { entries: apiData });
        const updatedEntries = mergeBulkApiResults(entries, validEntries, result?.data?.entries);

        setEntries(updatedEntries);
        setStats(calculateStats(updatedEntries));
        saveToLocalStorage("entries", updatedEntries);
        toast.success(`${validEntries.length} entries added successfully`);
        setShowBulkModal(false);
      } catch (error) {
        console.error("Error bulk adding timetable:", error);
        toast.error("Failed to add entries");
      } finally {
        setIsSaving(false);
      }
    },
    [entries, isSaving, syncToAPI]
  );

  const handleCopyFromPrevious = useCallback(
    async (sourceYear: string, targetYear: string) => {
      if (isSaving) return;

      const sourceEntries = entries.filter((e) => e.academicYear === sourceYear);
      if (sourceEntries.length === 0) {
        toast.error("No entries found for the source year");
        return;
      }

      setIsSaving(true);
      try {
        const copiedEntries = sourceEntries.map((e) => ({
          ...sanitizeEntry(e),
          id: `entry_${Date.now()}_${Math.random()}`,
          academicYear: targetYear,
          isActive: true,
        }));

        const apiData = copiedEntries.map(mapForApi);
        const result = await syncToAPI("POST", `${API_BASE}/timetable/bulk`, { entries: apiData });
        const updatedEntries = mergeBulkApiResults(entries, copiedEntries, result?.data?.entries);

        setEntries(updatedEntries);
        setStats(calculateStats(updatedEntries));
        saveToLocalStorage("entries", updatedEntries);
        toast.success(`${copiedEntries.length} entries copied to ${targetYear}`);
        setShowCopyModal(false);
      } catch (error) {
        console.error("Error copying timetable:", error);
        toast.error("Failed to copy entries");
      } finally {
        setIsSaving(false);
      }
    },
    [entries, isSaving, syncToAPI]
  );

  const handleEditRequest = useCallback((entry: TimetableEntry) => {
    const existingEntry = entries.find(e =>
      e.id === entry.id ||
      e._id === entry.id ||
      e.id === entry._id ||
      e._id === entry._id
    );

    if (existingEntry) {
      setEditingEntry(sanitizeEntry({
        ...existingEntry,
        id: existingEntry.id || existingEntry._id || `entry_${Date.now()}`,
        _id: existingEntry._id || existingEntry.id,
      }));
    } else {
      setEditingEntry(sanitizeEntry({
        ...entry,
        id: entry.id || entry._id || `entry_${Date.now()}`,
        _id: entry._id || entry.id,
      }));
    }
  }, [entries]);

  const closeEntryModal = useCallback(() => {
    setEditingEntry(null);
    setShowAddModal(false);
  }, []);

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  const exportToCSV = useCallback(() => {
    const combinedEntries = combineMultiSubjectEntries(filteredEntries);
    const headers = ["Day", "Start Time", "End Time", "Teacher", "Class", "Subject", "Cycle", "Rate", "Room"];
    const rows = combinedEntries.map((e) => [
      e.day,
      e.startTime,
      e.endTime,
      e.teacherName,
      e.className,
      e.subjectName,
      e.cycle === "first" ? "1st Cycle" : "2nd Cycle",
      e.ratePerPeriod,
      e.room || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map(csvField).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetable_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Timetable exported as CSV");
  }, [filteredEntries]);

  const exportToPDF = useCallback(() => window.print(), []);

  // ============================================
  // PDF DOWNLOAD - MATRIX FORMAT (Primary)
  // ============================================

  const downloadMatrixPDF = useCallback(async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await axios.get(`${API_BASE}/timetable`).catch(() => null);
      const rawEntries = res?.data?.success ? res.data.data : null;
      const freshEntries: TimetableEntry[] = rawEntries ? rawEntries.map(mapApiEntry) : entries;

      if (freshEntries.length === 0) {
        toast.error("No timetable entries to export");
        return;
      }

      let filteredForExport = freshEntries;
      if (filterClass) filteredForExport = filteredForExport.filter(e => e.classId === filterClass);
      if (filterTeacher) filteredForExport = filteredForExport.filter(e => e.teacherId === filterTeacher);

      // Get unique classes
      const classIds = new Set(filteredForExport.map(e => e.classId));
      const uniqueClasses = classes.filter(c => classIds.has(c._id));

      // Build matrix data
      const timeSlots = ["08:15", "09:00", "09:45", "11:00"];
      const labels = ["1", "2", "3", "4"];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

      // Build the data matrix
      const matrix: any = {};
      days.forEach(day => {
        matrix[day] = {};
        timeSlots.forEach(time => {
          matrix[day][time] = [];
        });
      });

      filteredForExport.forEach(entry => {
        if (matrix[entry.day] && matrix[entry.day][entry.startTime]) {
          matrix[entry.day][entry.startTime].push(entry);
        }
      });

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '-9999px';
      container.style.width = '1200px';
      container.style.backgroundColor = 'white';
      container.style.padding = '40px';
      container.style.zIndex = '9999';
      container.style.fontFamily = 'Arial, sans-serif';
      document.body.appendChild(container);

      // Build class names for header
      const classNames = uniqueClasses.map(c =>
        c.department ? `${c.className} ${c.department}` : c.className
      ).join(', ');

      let filterLabel = "";
      if (filterClass) {
        const cls = classes.find(c => c._id === filterClass);
        filterLabel = cls ? ` - ${cls.department ? `${cls.className} ${cls.department}` : cls.className}` : "";
      } else if (filterTeacher) {
        const teacher = teachers.find(t => t._id === filterTeacher);
        filterLabel = teacher ? ` - ${teacher.name}` : "";
      } else {
        filterLabel = classNames ? ` - ${classNames}` : "";
      }

      // Generate HTML content - Matrix format with teachers at the top
      let htmlContent = `
        <div style="background: white; padding: 20px; max-width: 1200px; margin: 0 auto;">
          ${pdfOptions.includeHeader ? `
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 3px solid #000000; padding-bottom: 15px;">
            <h1 style="font-size: 22px; margin: 0; color: #000000; font-weight: 800; letter-spacing: 2px;">BELMON BILINGUAL HIGH SCHOOL</h1>
            <p style="font-size: 14px; color: #000000; margin: 5px 0 0 0; font-weight: 600;">TIMETABLE • ${academicYear}</p>
            <p style="font-size: 12px; color: #000000; margin: 3px 0 0 0; font-weight: 500;">${classNames || 'All Classes'}${filterLabel}</p>
          </div>
          ` : ''}

          <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 2px solid #000000;">
            <thead>
              <tr style="background: #000000; color: white;">
                <th style="padding: 12px 10px; text-align: center; border: 1px solid #000000; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; min-width: 80px; background: #000000; color: white;">
                  TIME
                </th>
                ${days.map((day) => `
                  <th style="padding: 12px 10px; text-align: center; border: 1px solid #000000; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; min-width: 130px; background: #000000; color: white;">
                    ${day}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
      `;

      timeSlots.forEach((time, idx) => {
        const rowBg = idx % 2 === 0 ? 'background: #fafafa;' : 'background: white;';

        htmlContent += `
          <tr style="${rowBg}">
            <td style="padding: 12px 10px; text-align: center; border: 1px solid #000000; font-weight: 700; font-size: 12px;">
              <div style="font-size: 14px; font-weight: 800;">${labels[idx]}</div>
              <div style="font-size: 10px; color: #000000; font-weight: 400;">${time}</div>
            </td>
            ${days.map((day) => {
          const entries = matrix[day]?.[time] || [];

          if (entries.length === 0) {
            return `<td style="padding: 12px 10px; text-align: center; border: 1px solid #000000;">
                  <span style="color: #000000; font-size: 14px;">-</span>
                </td>`;
          }

          // Group entries by class
          const groupedByClass = new Map<string, TimetableEntry[]>();
          entries.forEach(entry => {
            const key = entry.classId;
            if (!groupedByClass.has(key)) {
              groupedByClass.set(key, []);
            }
            groupedByClass.get(key)!.push(entry);
          });

          const entriesHtml = Array.from(groupedByClass.values()).flat().map(entry => {
            const classObj = classes.find(c => c._id === entry.classId);
            const fullClassName = classObj?.department ? `${classObj.className} ${classObj.department}` : entry.className;

            return `
                  <div style="padding: 4px 0; border-bottom: 1px solid #eee; last-child: border-bottom: none;">
                    <div style="font-weight: 600; font-size: 11px; color: #1a1a1a;">${entry.subjectName}</div>
                    ${pdfOptions.showTeacherNames ? `<div style="font-size: 9px; color: #000000; font-weight: 500;">${entry.teacherName}</div>` : ''}
                    ${pdfOptions.showRoomNumbers && entry.room ? `<div style="font-size: 8px; color: #999;">${entry.room}</div>` : ''}
                    <div style="font-size: 8px; color: #666;">${fullClassName}</div>
                  </div>
                `;
          }).join('');

          return `<td style="padding: 8px 6px; text-align: center; border: 1px solid #000000; vertical-align: middle; min-height: 60px;">
                ${entriesHtml}
              </td>`;
        }).join('')}
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 15px; font-size: 9px; color: #000000; border-top: 1px solid #000000; padding-top: 10px;">
            <span>Generated: ${new Date().toLocaleString()}</span>
            <span style="margin: 0 15px;">|</span>
            <span>BELMON BILINGUAL HIGH SCHOOL</span>
            <span style="margin: 0 15px;">|</span>
            <span>Page 1 of 1</span>
            <span style="margin: 0 15px;">|</span>
            <span style="font-weight: 600;">${filterLabel}</span>
          </div>
        </div>
      `;

      container.innerHTML = htmlContent;
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(container, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
        onclone: (_doc, element) => flattenUnsupportedColors(element),
      });

      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= usableHeight) {
        const yOffset = (usableHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'JPEG', margin, margin + yOffset, imgWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let offset = 0;
        let isFirstPage = true;
        while (remainingHeight > 0) {
          if (!isFirstPage) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, margin - offset, imgWidth, imgHeight);
          remainingHeight -= usableHeight;
          offset += usableHeight;
          isFirstPage = false;
        }
      }

      document.body.removeChild(container);
      pdf.save(`timetable_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Timetable PDF downloaded");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to download PDF: ${message}`);
    } finally {
      setIsDownloadingPdf(false);
      setShowPdfOptions(false);
    }
  }, [entries, classes, teachers, filterClass, filterTeacher, academicYear, pdfOptions]);

  // ============================================
  // PDF DOWNLOAD - STANDARD FORMAT
  // ============================================

  const downloadStandardPDF = useCallback(async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await axios.get(`${API_BASE}/timetable`).catch(() => null);
      const rawEntries = res?.data?.success ? res.data.data : null;
      const freshEntries: TimetableEntry[] = rawEntries ? rawEntries.map(mapApiEntry) : entries;

      if (freshEntries.length === 0) {
        toast.error("No timetable entries to export");
        return;
      }

      let filteredForExport = freshEntries;
      if (filterClass) filteredForExport = filteredForExport.filter(e => e.classId === filterClass);
      if (filterTeacher) filteredForExport = filteredForExport.filter(e => e.teacherId === filterTeacher);

      const uniqueClasses = dedupeClassesByName(classes);
      const grid = buildPdfGrid(filteredForExport, uniqueClasses);

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '-9999px';
      container.style.width = '1100px';
      container.style.backgroundColor = 'white';
      container.style.padding = '20px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);

      let filterLabel = "";
      if (filterClass) {
        const cls = classes.find(c => c._id === filterClass);
        filterLabel = cls ? ` - ${cls.department ? `${cls.className} ${cls.department}` : cls.className}` : "";
      } else if (filterTeacher) {
        const teacher = teachers.find(t => t._id === filterTeacher);
        filterLabel = teacher ? ` - ${teacher.name}` : "";
      }

      let htmlContent = `
        <div style="font-family: Arial, sans-serif; background: white; padding: 10px;">
          ${pdfOptions.includeHeader ? `
          <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">
            <h2 style="font-size: 18px; margin: 0; color: #D4AF37; font-weight: 800;">BELMON BILINGUAL HIGH SCHOOL</h2>
            <p style="font-size: 11px; color: #666; margin: 3px 0;">Timetable • ${academicYear}${filterLabel}</p>
          </div>
          ` : ''}
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #D4AF37; color: white;">
                <th style="padding: 6px 8px; text-align: left; border: 1px solid #D4AF37; font-size: 10px; text-transform: uppercase; font-weight: 700;">Day</th>
                <th style="padding: 6px 8px; text-align: left; border: 1px solid #D4AF37; font-size: 10px; text-transform: uppercase; font-weight: 700;">Period</th>
                ${uniqueClasses.map((c) => `
                  <th style="padding: 6px 8px; text-align: center; border: 1px solid #D4AF37; font-size: 10px; text-transform: uppercase; font-weight: 700;">${c.department ? `${c.className} ${c.department}` : c.className}</th>
                `).join('')}
                <th style="padding: 6px 8px; text-align: left; border: 1px solid #D4AF37; font-size: 10px; text-transform: uppercase; font-weight: 700;">Time</th>
              </tr>
            </thead>
            <tbody>
      `;

      grid.forEach((row, index) => {
        const isFirstOfDay = index === 0 || grid[index - 1].day !== row.day;
        const dayRowspan = grid.filter((r) => r.day === row.day).length;

        htmlContent += `
          <tr style="${row.isBreak ? 'background: #fef3c7;' : ''}">
            ${isFirstOfDay ? `
              <td style="padding: 6px 8px; font-weight: 600; text-align: center; vertical-align: middle; border: 1px solid #ddd; background: #faf5e8;" rowspan="${dayRowspan}">
                ${row.day}
              </td>
            ` : ''}
            <td style="padding: 6px 8px; text-align: center; font-weight: 600; font-family: monospace; border: 1px solid #000000; ${row.isBreak ? 'color: #b45309;' : ''}">
              ${row.isBreak ? '' : row.period}
            </td>
            ${row.isBreak ? `
              <td style="padding: 6px 8px; text-align: center; border: 1px solid #000000; background: #fef3c7;" colspan="${uniqueClasses.length}">
                <span style="font-size: 11px; font-weight: 700; color: #000000; text-transform: uppercase; letter-spacing: 1px;">BREAK TIME</span>
              </td>
            ` : uniqueClasses.map((c) => {
          const cell = row.cells[c.className];
          return `
                <td style="padding: 6px 8px; text-align: center; border: 1px solid #000000;">
                  ${cell ? `
                    <div style="font-weight: 500; font-size: ${cell.subjectName.includes('/') ? '10px' : '11px'};">${cell.subjectName}</div>
                    ${pdfOptions.showTeacherNames ? `<div style="font-size: 9px; color: #666;">${cell.teacherName}</div>` : ''}
                    ${pdfOptions.showRoomNumbers && cell.room ? `<div style="font-size: 8px; color: #999;">${cell.room}</div>` : ''}
                  ` : '<span style="color: #ccc;">—</span>'}
                </td>
              `;
        }).join('')}
            <td style="padding: 6px 8px; text-align: center; font-size: 10px; border: 1px solid #ddd; white-space: nowrap;">
              ${row.duration}
            </td>
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>
          <div style="text-align: center; margin-top: 8px; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 6px;">
            Generated: ${new Date().toLocaleString()}
          </div>
        </div>
      `;

      container.innerHTML = htmlContent;
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
        onclone: (_doc, element) => flattenUnsupportedColors(element),
      });

      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= usableHeight) {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      } else {
        let remainingHeight = imgHeight;
        let offset = 0;
        let isFirstPage = true;
        while (remainingHeight > 0) {
          if (!isFirstPage) pdf.addPage();
          pdf.addImage(imgData, 'JPEG', margin, margin - offset, imgWidth, imgHeight);
          remainingHeight -= usableHeight;
          offset += usableHeight;
          isFirstPage = false;
        }
      }

      document.body.removeChild(container);
      pdf.save(`timetable_standard_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Standard timetable PDF downloaded");
    } catch (error) {
      console.error("Error downloading timetable PDF:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to download PDF: ${message}`);
    } finally {
      setIsDownloadingPdf(false);
      setShowPdfOptions(false);
    }
  }, [entries, classes, teachers, filterClass, filterTeacher, academicYear, pdfOptions]);

  // ============================================
  // PDF DOWNLOAD - PAGINATED
  // ============================================

  const downloadPaginatedPDF = useCallback(async () => {
    setIsDownloadingPdf(true);
    try {
      const res = await axios.get(`${API_BASE}/timetable`).catch(() => null);
      const rawEntries = res?.data?.success ? res.data.data : null;
      const freshEntries: TimetableEntry[] = rawEntries ? rawEntries.map(mapApiEntry) : entries;

      if (freshEntries.length === 0) {
        toast.error("No timetable entries to export");
        return;
      }

      let filteredForExport = freshEntries;
      if (filterClass) filteredForExport = filteredForExport.filter(e => e.classId === filterClass);
      if (filterTeacher) filteredForExport = filteredForExport.filter(e => e.teacherId === filterTeacher);

      if (filteredForExport.length === 0) {
        toast.error("No entries found for the selected filter");
        return;
      }

      const classNamesSet = new Set<string>();
      filteredForExport.forEach(e => {
        classNamesSet.add(e.className);
      });
      const uniqueClassNames = Array.from(classNamesSet).sort();

      const pageGrids = buildPaginatedPdfGrids(filteredForExport, []);

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '-9999px';
      container.style.width = '1100px';
      container.style.backgroundColor = 'white';
      container.style.padding = '20px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);

      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const classNamesHeader = uniqueClassNames.join(', ');

      let filterLabel = "";
      if (filterClass) {
        const cls = classes.find(c => c._id === filterClass);
        filterLabel = cls ? ` - ${cls.className}` : "";
      } else if (filterTeacher) {
        const teacher = teachers.find(t => t._id === filterTeacher);
        filterLabel = teacher ? ` - ${teacher.name}` : "";
      } else {
        filterLabel = classNamesHeader ? ` - ${classNamesHeader}` : "";
      }

      for (let pageIndex = 0; pageIndex < pageGrids.length; pageIndex++) {
        const gridRows = pageGrids[pageIndex];
        const pageLabel = pageIndex === 0 ? "Monday - Wednesday" : "Thursday - Friday";

        const pageClassNames = new Set<string>();
        gridRows.forEach(row => {
          Object.keys(row.cells).forEach(cls => pageClassNames.add(cls));
        });
        const pageClassList = Array.from(pageClassNames).sort();

        let htmlContent = `
          <div style="font-family: Arial, sans-serif; background: white; padding: 10px;">
            ${pdfOptions.includeHeader ? `
            <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000000; padding-bottom: 8px;">
              <h2 style="font-size: 18px; margin: 0; color: #000000; font-weight: 800;">BELMON BILINGUAL HIGH SCHOOL</h2>
              <p style="font-size: 11px; font-weight:bold; color: #000000; margin: 3px 0;">Timetable • ${academicYear}${filterLabel} • ${pageLabel}</p>
            </div>
            ` : ''}
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #000000; color: white;">
                  <th style="padding: 6px 8px; text-align: left; border: 1px solid #000000; font-size: 10px; text-transform: uppercase; font-weight: 700;">Day</th>
                  ${pageClassList.map((cls) => `
                    <th style="padding: 6px 8px; text-align: center; border: 1px solid #000000; font-size: 10px; text-transform: uppercase; font-weight: 700;">${cls}</th>
                  `).join('')}
                  <th style="padding: 6px 8px; text-align: left; border: 1px solid #000000; font-size: 10px; text-transform: uppercase; font-weight: 700;">Time</th>
                </tr>
              </thead>
              <tbody>
        `;

        gridRows.forEach((row, index) => {
          const isFirstOfDay = index === 0 || gridRows[index - 1].day !== row.day;
          const dayRowspan = gridRows.filter((r) => r.day === row.day).length;

          htmlContent += `
            <tr style="${row.isBreak ? 'background: #fef3c7;' : ''}">
              ${isFirstOfDay ? `
                <td style="padding: 6px 8px; font-weight: 600; text-align: center; vertical-align: middle; font-weight:bold; border: 1px solid #000000; background: #faf5e8;" rowspan="${dayRowspan}">
                  ${row.day}
                </td>
              ` : ''}

              ${row.isBreak ? `
                <td style="padding: 6px 8px; text-align: center; border: 1px solid #000000; background: #fef3c7;" colspan="${pageClassList.length}">
                  <span style="font-size: 11px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 1px;">BREAK TIME</span>
                </td>
              ` : pageClassList.map((cls) => {
            const cell = row.cells[cls];
            return `
                  <td style="padding: 6px 8px; text-align: center; border: 1px solid #000000;">
                    ${cell ? `
                      <div style="font-weight: 500; font-size: ${cell.subjectName.includes('/') ? '10px' : '11px'};">${cell.subjectName}</div>
                      ${pdfOptions.showTeacherNames ? `<div style="font-size: 9px; color: #000000; font-weight: bold;">${cell.teacherName}</div>` : ''}
                    ` : '<span style="color: #000000;">—</span>'}
                  </td>
                `;
          }).join('')}
              <td style="padding: 6px 8px; text-align: center; font-size: 10px; border: 1px solid #000000; white-space: nowrap;">
                ${row.duration}
              </td>
            </tr>
          `;
        });

        htmlContent += `
              </tbody>
            </table>
            <div style="text-align: center; margin-top: 8px; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 6px;">
              Generated: ${new Date().toLocaleString()} • Page ${pageIndex + 1} of ${pageGrids.length}
            </div>
          </div>
        `;

        container.innerHTML = htmlContent;
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: container.scrollWidth,
          height: container.scrollHeight,
          onclone: (_doc, element) => flattenUnsupportedColors(element),
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, Math.min(imgHeight, usableHeight));
      }

      document.body.removeChild(container);
      pdf.save(`timetable_paginated_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Paginated timetable PDF downloaded");
    } catch (error) {
      console.error("Error downloading paginated PDF:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to download PDF: ${message}`);
    } finally {
      setIsDownloadingPdf(false);
      setShowPdfOptions(false);
    }
  }, [entries, classes, teachers, filterClass, filterTeacher, academicYear, pdfOptions]);

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-black/60 font-medium">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-center gap-2">
          <AlertCircle className="size-4" />
          {apiError}
        </div>
      )}
      {!isOnline && !apiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 flex items-center gap-2">
          <AlertCircle className="size-4" />
          Offline mode - Changes are saved locally
        </div>
      )}
      {isSaving && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 flex items-center gap-2">
          <RefreshCw className="size-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Calendar className="size-8 text-brand" />
            Timetable Management
          </h1>
          <p className="text-sm text-black/60 mt-1">
            {entries.length} periods scheduled • {stats.totalTeachers} teachers • {stats.totalClasses} classes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Class Filter */}
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setFilterTeacher("");
            }}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium min-w-[140px]"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.department ? `${c.className} ${c.department}` : c.className}
              </option>
            ))}
          </select>

          {/* Teacher Filter */}
          <select
            value={filterTeacher}
            onChange={(e) => {
              setFilterTeacher(e.target.value);
              setFilterClass("");
            }}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-sm font-medium min-w-[140px]"
          >
            <option value="">All Teachers</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          <button
            onClick={() => setShowBulkModal(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand/20 text-brand text-sm font-semibold hover:bg-brand/5 transition-all disabled:opacity-50"
          >
            <Upload className="size-4" /> Bulk Add
          </button>
          <button
            onClick={() => setShowCopyModal(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand/20 text-brand text-sm font-semibold hover:bg-brand/5 transition-all disabled:opacity-50"
          >
            <Copy className="size-4" /> Copy Year
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-stone-200 text-sm font-semibold hover:bg-stone-50 transition-all"
          >
            <FileSpreadsheet className="size-4" /> Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-stone-200 text-sm font-semibold hover:bg-stone-50 transition-all"
          >
            <Printer className="size-4" /> Print
          </button>

          {/* PDF Download - Primary Button with Matrix Format */}
          <div className="relative">
            <button
              onClick={() => {
                setPdfOptions(prev => ({ ...prev, format: "matrix" }));
                downloadMatrixPDF();
              }}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-all disabled:opacity-50 shadow-lg shadow-brand/20"
            >
              {isDownloadingPdf ? (
                <span className="animate-spin"><RefreshCw className="size-4" /></span>
              ) : (
                <FileDown className="size-4" />
              )}
              {isDownloadingPdf ? "Generating..." : "Download Timetable"}
            </button>

            {/* PDF Options Dropdown */}
            <button
              onClick={() => setShowPdfOptions(!showPdfOptions)}
              className="ml-1 p-2.5 rounded-xl border border-brand/20 text-brand hover:bg-brand/5 transition"
            >
              <Settings className="size-4" />
            </button>

            {showPdfOptions && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl border border-stone-200 shadow-lg z-20 p-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-black/50 uppercase tracking-wider">PDF Options</p>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pdfOptions.showTeacherNames}
                        onChange={(e) => setPdfOptions(prev => ({ ...prev, showTeacherNames: e.target.checked }))}
                        className="rounded border-stone-300 text-brand focus:ring-brand"
                      />
                      Show Teacher Names
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pdfOptions.showRoomNumbers}
                        onChange={(e) => setPdfOptions(prev => ({ ...prev, showRoomNumbers: e.target.checked }))}
                        className="rounded border-stone-300 text-brand focus:ring-brand"
                      />
                      Show Room Numbers
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pdfOptions.includeHeader}
                        onChange={(e) => setPdfOptions(prev => ({ ...prev, includeHeader: e.target.checked }))}
                        className="rounded border-stone-300 text-brand focus:ring-brand"
                      />
                      Include School Header
                    </label>
                  </div>

                  <div className="border-t border-stone-200 pt-2">
                    <p className="text-xs font-bold text-black/50 uppercase tracking-wider mb-2">Format</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => {
                          setPdfOptions(prev => ({ ...prev, format: "matrix" }));
                          setShowPdfOptions(false);
                          downloadMatrixPDF();
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition ${pdfOptions.format === "matrix" ? "bg-brand text-white" : "bg-stone-100 hover:bg-stone-200"}`}
                      >
                        Matrix
                      </button>
                      <button
                        onClick={() => {
                          setPdfOptions(prev => ({ ...prev, format: "standard" }));
                          setShowPdfOptions(false);
                          downloadStandardPDF();
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition ${pdfOptions.format === "standard" ? "bg-brand text-white" : "bg-stone-100 hover:bg-stone-200"}`}
                      >
                        Standard
                      </button>
                      <button
                        onClick={() => {
                          setPdfOptions(prev => ({ ...prev, format: "paginated" }));
                          setShowPdfOptions(false);
                          downloadPaginatedPDF();
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition ${pdfOptions.format === "paginated" ? "bg-brand text-white" : "bg-stone-100 hover:bg-stone-200"}`}
                      >
                        Paginated
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
          >
            <Plus className="size-4" /> Add Period
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      {(filterClass || filterTeacher) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800 flex items-center justify-between">
          <span>
            {filterClass && `Viewing: ${classes.find(c => c._id === filterClass)?.department ? `${classes.find(c => c._id === filterClass)?.className} ${classes.find(c => c._id === filterClass)?.department}` : classes.find(c => c._id === filterClass)?.className || 'Class'}`}
            {filterTeacher && `Viewing: ${teachers.find(t => t._id === filterTeacher)?.name || 'Teacher'}`}
          </span>
          <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 font-medium">
            <X className="size-4 inline" /> Clear Filter
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Periods" value={filteredEntries.length} />
        <StatCard label="Teachers" value={stats.totalTeachers} />
        <StatCard label="Classes" value={stats.totalClasses} />
        <StatCard label="1st Cycle" value={stats.firstCyclePeriods} valueClassName="text-blue-600" />
        <StatCard label="2nd Cycle" value={stats.secondCyclePeriods} valueClassName="text-purple-600" />
        <div className="bg-white rounded-2xl border border-brand/20 p-4 bg-brand/5">
          <p className="text-xs text-brand/60 font-medium uppercase tracking-wider">Potential Revenue</p>
          <p className="text-2xl font-bold text-brand mt-1">{stats.totalPotential.toLocaleString()} FRS</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/40" />
          <input
            type="text"
            placeholder="Search by teacher, class, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[150px]"
        >
          <option value="">All Teachers</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[150px]"
        >
          <option value="">All Classes</option>
          {uniqueClasses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.department ? `${c.className} ${c.department}` : c.className}
            </option>
          ))}
        </select>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[130px]"
        >
          <option value="">All Days</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[130px]"
        >
          <option value="">All Cycles</option>
          <option value="first">1st Cycle</option>
          <option value="second">2nd Cycle</option>
        </select>

        <div className="flex gap-1 border border-stone-200 rounded-xl p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition ${viewMode === "table" ? "bg-brand text-white" : "hover:bg-stone-100"}`}
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-brand text-white" : "hover:bg-stone-100"}`}
          >
            <Grid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-lg transition ${viewMode === "calendar" ? "bg-brand text-white" : "hover:bg-stone-100"}`}
          >
            <CalendarDays className="size-4" />
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition whitespace-nowrap"
          >
            <X className="size-4 inline mr-1" /> Clear
          </button>
        )}
      </div>

      {/* View Content - Using combined entries for display */}
      {viewMode === "table" && (
        <TableView
          entries={combineMultiSubjectEntries(filteredEntries)}
          onEdit={handleEditRequest}
          onDelete={handleDeleteEntry}
          canEdit={true}
        />
      )}
      {viewMode === "grid" && (
        <GridView
          entries={combineMultiSubjectEntries(filteredEntries)}
          onEdit={handleEditRequest}
          onDelete={handleDeleteEntry}
        />
      )}
      {viewMode === "calendar" && (
        <CalendarView
          entries={combineMultiSubjectEntries(filteredEntries)}
          onEdit={handleEditRequest}
        />
      )}

      {/* Modals */}
      {(showAddModal || editingEntry) && (
        <TimetableEntryModal
          initial={
            editingEntry || {
              id: `entry_${Date.now()}`,
              teacherId: "",
              teacherName: "",
              classId: "",
              className: "",
              subjectId: "",
              subjectName: "",
              subjectCode: "",
              day: "Monday",
              startTime: "08:00",
              endTime: "09:00",
              periodNumber: 1,
              cycle: "first",
              ratePerPeriod: CYCLE_RATES.first,
              room: "",
              academicYear: academicYear,
              isActive: true,
            }
          }
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          onSave={handleSaveEntry}
          onCancel={closeEntryModal}
        />
      )}

      {showBulkModal && (
        <BulkAddModal
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          onSave={handleBulkAdd}
          onCancel={() => setShowBulkModal(false)}
        />
      )}

      {showCopyModal && (
        <CopyYearModal currentYear={academicYear} onCopy={handleCopyFromPrevious} onCancel={() => setShowCopyModal(false)} />
      )}
    </div>
  );
}

// ============================================
// TABLE VIEW
// ============================================

const TableView = memo(function TableView({
  entries,
  onEdit,
  onDelete,
  canEdit,
}: {
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Day</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Teacher</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Class</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Cycle</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Rate</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase tracking-wider">Room</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-bold text-black/50 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 10 : 9} className="px-4 py-12 text-center text-black/40">
                  <CalendarDays className="size-12 mx-auto text-black/20 mb-3" />
                  <p>No timetable entries found</p>
                  <p className="text-sm">Try adjusting your filters or add a new entry</p>
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr key={entry.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                  <td className="px-4 py-3 text-sm text-black/40">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{entry.day}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3 text-black/40" />
                      {entry.startTime} - {entry.endTime}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{entry.teacherName}</td>
                  <td className="px-4 py-3 text-sm">{entry.className}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {entry.subjectCode && (
                        <span className="text-xs bg-stone-100 px-1.5 py-0.5 rounded font-mono">{entry.subjectCode}</span>
                      )}
                      <span className={entry.subjectName.includes('/') ? 'text-amber-700 font-semibold' : ''}>
                        {entry.subjectName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <CycleBadge cycle={entry.cycle} />
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-brand">{entry.ratePerPeriod} FRS</td>
                  <td className="px-4 py-3 text-sm">{entry.room || "-"}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(entry)} className="p-1.5 rounded-lg hover:bg-stone-100 text-black/60 transition">
                          <Pencil className="size-4" />
                        </button>
                        <button onClick={() => onDelete(entry.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {entries.length > 0 && (
        <div className="px-4 py-3 border-t border-stone-200 text-sm text-black/40 flex justify-between items-center">
          <span>Showing {entries.length} entries</span>
          <span>Academic Year: {entries[0]?.academicYear || "2026-2027"}</span>
        </div>
      )}
    </div>
  );
});

// ============================================
// GRID VIEW
// ============================================

const GridView = memo(function GridView({
  entries,
  onEdit,
  onDelete,
}: {
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <CalendarDays className="size-12 mx-auto text-black/20 mb-3" />
          <p className="text-black/40">No entries found</p>
        </div>
      ) : (
        entries.map((entry) => (
          <div key={entry.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${entry.cycle === "first" ? "bg-blue-50" : "bg-purple-50"}`}>
                  <Calendar className={`size-4 ${entry.cycle === "first" ? "text-blue-600" : "text-purple-600"}`} />
                </div>
                <div>
                  <p className="font-bold text-lg">{entry.day}</p>
                  <p className="text-xs text-black/40">{entry.startTime} - {entry.endTime}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(entry)} className="p-1.5 rounded-lg hover:bg-stone-100 text-black/60 transition">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => onDelete(entry.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-black/40" />
                <span className="font-medium">{entry.teacherName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-black/40" />
                <span>{entry.className}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-black/40" />
                <span className={entry.subjectName.includes('/') ? 'text-amber-700 font-semibold' : ''}>
                  {entry.subjectName}
                </span>
              </div>
              {entry.room && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-black/40">Room:</span>
                  <span>{entry.room}</span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
              <CycleBadge cycle={entry.cycle} />
              <span className="font-bold text-brand">{entry.ratePerPeriod} FRS/period</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
});

// ============================================
// CALENDAR VIEW
// ============================================

const CalendarView = memo(function CalendarView({
  entries,
  onEdit,
}: {
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
}) {
  const entriesByDayTime = useMemo(() => {
    const map = new Map<string, TimetableEntry[]>();
    entries.forEach((e) => {
      const key = `${e.day}|${e.startTime}`;
      const bucket = map.get(key);
      if (bucket) bucket.push(e);
      else map.set(key, [e]);
    });
    return map;
  }, [entries]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-stone-200">
        <h3 className="font-semibold flex items-center gap-2">
          <CalendarDays className="size-5 text-brand" />
          Weekly Calendar View
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-2 py-2 text-xs font-bold text-black/40 uppercase tracking-wider w-16">Time</th>
              {DAYS.map((day) => (
                <th key={day} className="px-2 py-2 text-xs font-bold text-black/50 uppercase tracking-wider min-w-[120px]">
                  {day.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CALENDAR_TIME_SLOTS.map((time) => (
              <tr key={time} className="border-t border-stone-100">
                <td className="px-2 py-2 text-xs text-black/40 font-medium text-center">{time}</td>
                {DAYS.map((day) => {
                  const dayEntries = entriesByDayTime.get(`${day}|${time}`) || [];
                  return (
                    <td key={`${day}-${time}`} className="px-1 py-1 min-h-[60px]">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          onClick={() => onEdit(entry)}
                          className={`text-xs p-1.5 rounded-lg cursor-pointer hover:opacity-80 transition ${entry.cycle === "first" ? "bg-blue-50 border border-blue-200" : "bg-purple-50 border border-purple-200"
                            }`}
                        >
                          <div className="font-semibold truncate">{entry.teacherName}</div>
                          <div className={`truncate ${entry.subjectName.includes('/') ? 'text-amber-700 font-bold' : 'text-black/60'}`}>
                            {entry.subjectName}
                          </div>
                          <div className="truncate text-black/40 text-[10px]">{entry.className}</div>
                          <div className="text-[10px] font-bold text-brand mt-0.5">{entry.ratePerPeriod} FRS</div>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-stone-200 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
          <span className="text-black/60">1st Cycle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
          <span className="text-black/60">2nd Cycle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-black/40">Click on any period to edit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-700 font-semibold">Multi-subject</span>
        </div>
      </div>
    </div>
  );
});

// ============================================
// TIMETABLE ENTRY MODAL
// ============================================

function TimetableEntryModal({
  initial,
  teachers,
  classes,
  subjects,
  onSave,
  onCancel,
}: {
  initial: TimetableEntry;
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  onSave: (entry: TimetableEntry) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TimetableEntry>(() => sanitizeEntry(initial));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(sanitizeEntry(initial));
  }, [initial]);

  const set = <K extends keyof TimetableEntry>(k: K, v: TimetableEntry[K]) => setForm((f) => ({ ...f, [k]: v }));

  const isNewEntry = !initial._id && !initial.id?.startsWith('6a') || initial.id?.startsWith('entry_');

  const handleSubmit = () => {
    const { startTime, endTime } = sanitizeTimes(form.startTime, form.endTime);

    if (startTime >= endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    const finalEntry: TimetableEntry = { ...form, startTime, endTime };

    setSaving(true);
    try {
      onSave(finalEntry);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl flex items-center gap-3">
            <Calendar className="size-6 text-brand" />
            {isNewEntry ? "Add New Period" : "Edit Timetable Entry"}
          </h3>
          <button onClick={onCancel} className="text-black/40 hover:text-black/70">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Day*">
            <select value={form.day} onChange={(e) => set("day", e.target.value)} className={inputCls}>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>

          <Field label="Period Number*">
            <input
              type="number"
              value={form.periodNumber}
              onChange={(e) => set("periodNumber", parseInt(e.target.value) || 1)}
              className={inputCls}
              min="1"
              max="8"
            />
          </Field>

          <Field label="Start Time*">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => set("startTime", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="End Time*">
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Teacher*">
            <select
              value={form.teacherId}
              onChange={(e) => {
                const teacher = teachers.find((t) => t._id === e.target.value);
                set("teacherId", e.target.value);
                set("teacherName", teacher?.name || "");
              }}
              className={inputCls}
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Class*">
            <select
              value={form.classId}
              onChange={(e) => {
                const cls = classes.find((c) => c._id === e.target.value);
                set("classId", e.target.value);
                set("className", cls?.className || "");
              }}
              className={inputCls}
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.department ? `${c.className} ${c.department}` : c.className}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Subject*">
            <select
              value={form.subjectId}
              onChange={(e) => {
                const subj = subjects.find((s) => s._id === e.target.value);
                set("subjectId", e.target.value);
                set("subjectName", subj?.name || "");
                set("subjectCode", subj?.code || "");
              }}
              className={inputCls}
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </Field>

          <Field label="Cycle*">
            <select
              value={form.cycle}
              onChange={(e) => {
                const cycle = e.target.value as "first" | "second";
                set("cycle", cycle);
                set("ratePerPeriod", CYCLE_RATES[cycle]);
              }}
              className={inputCls}
            >
              <option value="first">First Cycle ({CYCLE_RATES.first} FRS)</option>
              <option value="second">Second Cycle ({CYCLE_RATES.second} FRS)</option>
            </select>
          </Field>

          <Field label="Room">
            <input type="text" value={form.room || ""} onChange={(e) => set("room", e.target.value)} className={inputCls} placeholder="Room number" />
          </Field>

          <Field label="Academic Year">
            <input
              type="text"
              value={form.academicYear}
              onChange={(e) => set("academicYear", e.target.value)}
              className={inputCls}
              placeholder="2026-2027"
            />
          </Field>

          <div className="sm:col-span-2 bg-stone-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rate per Period:</span>
              <span className="text-xl font-bold text-brand">{form.ratePerPeriod} FRS</span>
            </div>
            <p className="text-xs text-black/40 mt-1">
              {form.cycle === "first"
                ? `First cycle rate: ${CYCLE_RATES.first} FRS per period`
                : `Second cycle rate: ${CYCLE_RATES.second} FRS per period`}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <span className="font-bold">💡 Multi-Subject Support:</span>
            <br />
            You can add multiple subjects to the same class at the same time.
            Just make sure each subject has a <span className="font-bold">different teacher</span>.
            <br />
            <span className="text-xs text-amber-600 mt-1 block">
              Example: Form 4A can have both Math (Teacher A) and Physics (Teacher B) at 08:00-09:00
            </span>
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-stone-100">
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold hover:bg-stone-50 transition" disabled={saving}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand/20"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              isNewEntry ? "Add Period" : "Update Entry"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// BULK ADD MODAL
// ============================================

function BulkAddModal({
  teachers,
  classes,
  subjects,
  onSave,
  onCancel,
}: {
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  onSave: (entries: TimetableEntry[]) => void;
  onCancel: () => void;
}) {
  const [rows, setRows] = useState<Partial<TimetableEntry>[]>([
    { day: "Monday", periodNumber: 1, cycle: "first", ratePerPeriod: CYCLE_RATES.first },
  ]);
  const [saving, setSaving] = useState(false);

  const addRow = () => {
    setRows([...rows, { day: "Monday", periodNumber: rows.length + 1, cycle: "first", ratePerPeriod: CYCLE_RATES.first }]);
  };

  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "cycle") {
      updated[index].ratePerPeriod = CYCLE_RATES[value as "first" | "second"];
    }
    setRows(updated);
  };

  const validRowCount = rows.filter((e) => e.teacherId && e.classId && e.subjectId).length;

  const handleSubmit = () => {
    const validEntries = rows.filter((e) => e.teacherId && e.classId && e.subjectId);
    if (validEntries.length === 0) {
      toast.error("Please fill in all required fields for at least one row");
      return;
    }

    const formattedEntries = validEntries.map((e) => {
      const { startTime, endTime } = sanitizeTimes(e.startTime, e.endTime);
      return {
        ...e,
        startTime,
        endTime,
        id: `entry_${Date.now()}_${Math.random()}`,
        teacherName: teachers.find((t) => t._id === e.teacherId)?.name || "",
        className: classes.find((c) => c._id === e.classId)?.className || "",
        subjectName: subjects.find((s) => s._id === e.subjectId)?.name || "",
        academicYear: "2026-2027",
        isActive: true,
      };
    }) as TimetableEntry[];

    setSaving(true);
    try {
      onSave(formattedEntries);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl flex items-center gap-3">
            <Upload className="size-6 text-brand" />
            Bulk Add Timetable Entries
          </h3>
          <button onClick={onCancel} className="text-black/40 hover:text-black/70">
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50">
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">#</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">Day*</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">Period</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">Teacher*</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">Class*</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">Subject*</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">Cycle</th>
                <th className="px-2 py-2 text-left text-xs font-bold text-black/50">Rate</th>
                <th className="px-2 py-2 text-center text-xs font-bold text-black/50">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry, index) => (
                <tr key={index} className="border-b border-stone-100">
                  <td className="px-2 py-2 text-center text-black/40">{index + 1}</td>
                  <td className="px-2 py-2">
                    <select value={entry.day || "Monday"} onChange={(e) => updateRow(index, "day", e.target.value)} className="w-full px-2 py-1 rounded border border-stone-200 text-sm">
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d.substring(0, 3)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={entry.periodNumber || 1}
                      onChange={(e) => updateRow(index, "periodNumber", parseInt(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-stone-200 text-sm"
                      min="1"
                      max="8"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select value={entry.teacherId || ""} onChange={(e) => updateRow(index, "teacherId", e.target.value)} className="w-full px-2 py-1 rounded border border-stone-200 text-sm">
                      <option value="">Select</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select value={entry.classId || ""} onChange={(e) => updateRow(index, "classId", e.target.value)} className="w-full px-2 py-1 rounded border border-stone-200 text-sm">
                      <option value="">Select</option>
                      {classes.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.department ? `${c.className} ${c.department}` : c.className}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select value={entry.subjectId || ""} onChange={(e) => updateRow(index, "subjectId", e.target.value)} className="w-full px-2 py-1 rounded border border-stone-200 text-sm">
                      <option value="">Select</option>
                      {subjects.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select value={entry.cycle || "first"} onChange={(e) => updateRow(index, "cycle", e.target.value)} className="w-full px-2 py-1 rounded border border-stone-200 text-sm">
                      <option value="first">1st</option>
                      <option value="second">2nd</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-brand">
                    {entry.cycle === "first" ? CYCLE_RATES.first : CYCLE_RATES.second} FRS
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button onClick={() => removeRow(index)} className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-stone-300 text-sm font-semibold hover:border-brand/50 hover:text-brand transition">
            <Plus className="size-4" /> Add Row
          </button>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold hover:bg-stone-50 transition" disabled={saving}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Adding..." : `Add ${validRowCount} Entries`}
            </button>
          </div>
        </div>
        <p className="text-xs text-amber-600 mt-3">
          💡 Multiple subjects can be assigned to the same class at the same time. They will appear as "Subject1/Subject2" in the timetable.
        </p>
      </div>
    </div>
  );
}

// ============================================
// COPY YEAR MODAL
// ============================================

function CopyYearModal({
  currentYear,
  onCopy,
  onCancel,
}: {
  currentYear: string;
  onCopy: (sourceYear: string, targetYear: string) => void;
  onCancel: () => void;
}) {
  const [sourceYear, setSourceYear] = useState("2025-2026");
  const [targetYear, setTargetYear] = useState(currentYear);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display font-bold text-xl flex items-center gap-3 mb-5">
          <Copy className="size-6 text-brand" />
          Copy Timetable from Previous Year
        </h3>

        <div className="space-y-4">
          <Field label="Source Academic Year">
            <input type="text" value={sourceYear} onChange={(e) => setSourceYear(e.target.value)} className={inputCls} placeholder="2025-2026" />
          </Field>

          <Field label="Target Academic Year">
            <input type="text" value={targetYear} onChange={(e) => setTargetYear(e.target.value)} className={inputCls} placeholder={currentYear} />
          </Field>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
            <AlertCircle className="size-4 inline mr-2" />
            This will copy all timetable entries from the source year to the target year.
            Existing entries in the target year will not be overwritten.
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-stone-100">
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold hover:bg-stone-50 transition">
            Cancel
          </button>
          <button
            onClick={() => onCopy(sourceYear, targetYear)}
            className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition shadow-lg shadow-brand/20"
          >
            <Copy className="size-4 inline mr-2" />
            Copy Timetable
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

const inputCls = "w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest font-bold text-black/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}