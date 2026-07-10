import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Calendar, Clock, Users, Plus, Pencil, Trash2, Search, X, 
  DollarSign, CalendarDays, User, BookOpen, Download, Printer, 
  Eye, Filter, ChevronLeft, ChevronRight, Grid, List, 
  AlertCircle, Check, Copy, RefreshCw, Upload, FileSpreadsheet,
  Settings, Bell, Menu, Sun, Moon, LogOut, Home, Layout
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = "https://belmon-backend.onrender.com/api";

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
  const [stats, setStats] = useState<TimetableStats>({
    totalPeriods: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalPotential: 0,
    firstCyclePeriods: 0,
    secondCyclePeriods: 0
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================

  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(`timetable_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const loadFromLocalStorage = (key: string) => {
    try {
      const data = localStorage.getItem(`timetable_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return null;
    }
  };

  // ============================================
  // DATA MAPPING FUNCTIONS
  // ============================================

  const mapApiEntry = (entry: any): TimetableEntry => {
    // Handle both API format and local format
    const teacherObj = entry.teacherId || {};
    const classObj = entry.classId || {};
    const subjectObj = entry.subjectId || {};
    
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
      startTime: entry.startTime || "",
      endTime: entry.endTime || "",
      periodNumber: entry.periodNumber || 1,
      cycle: entry.cycle || "first",
      ratePerPeriod: entry.ratePerPeriod || 500,
      room: entry.room || "",
      academicYear: entry.academicYear || "2024-2025",
      isActive: entry.isActive !== undefined ? entry.isActive : true
    };
  };

  const mapForApi = (entry: TimetableEntry) => {
    return {
      teacherId: entry.teacherId,
      classId: entry.classId,
      subjectId: entry.subjectId,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      periodNumber: entry.periodNumber,
      cycle: entry.cycle,
      room: entry.room || "",
      academicYear: entry.academicYear || "2024-2025",
      isActive: entry.isActive
    };
  };

  // ============================================
  // GENERATE MOCK DATA
  // ============================================

  const generateMockData = () => {
    const mockTeachers = [
      { _id: "t1", name: "John Doe", email: "john@school.com", phone: "699123456", qualification: "BSc Math", subjectIds: ["s1"], classIds: ["c1"] },
      { _id: "t2", name: "Jane Smith", email: "jane@school.com", phone: "699234567", qualification: "BEd English", subjectIds: ["s2"], classIds: ["c2"] },
      { _id: "t3", name: "Michael Brown", email: "michael@school.com", phone: "699345678", qualification: "PhD Physics", subjectIds: ["s3"], classIds: ["c3"] },
      { _id: "t4", name: "Sarah Wilson", email: "sarah@school.com", phone: "699456789", qualification: "MSc Chemistry", subjectIds: ["s4"], classIds: ["c1"] },
      { _id: "t5", name: "David Kim", email: "david@school.com", phone: "699567890", qualification: "BEd History", subjectIds: ["s5"], classIds: ["c3"] },
    ];
    
    const mockClasses = [
      { _id: "c1", className: "Form 4 Science A", department: "Science" },
      { _id: "c2", className: "Form 5 Science A", department: "Science" },
      { _id: "c3", className: "Form 3 Arts", department: "Arts" },
      { _id: "c4", className: "Form 4 Commercial", department: "Commercial" },
      { _id: "c5", className: "Form 5 Arts", department: "Arts" },
    ];
    
    const mockSubjects = [
      { _id: "s1", name: "Mathematics", code: "MATH" },
      { _id: "s2", name: "English", code: "ENG" },
      { _id: "s3", name: "Physics", code: "PHY" },
      { _id: "s4", name: "Chemistry", code: "CHEM" },
      { _id: "s5", name: "History", code: "HIST" },
      { _id: "s6", name: "Geography", code: "GEOG" },
    ];

    const mockEntries: TimetableEntry[] = [];
    const periods = [1, 2, 3, 4, 5, 6];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    mockTeachers.forEach((teacher, ti) => {
      days.forEach((day, di) => {
        periods.forEach((period, pi) => {
          if (Math.random() > 0.5) {
            const cls = mockClasses[(ti + di + pi) % mockClasses.length];
            const subj = mockSubjects[(ti + di) % mockSubjects.length];
            const cycle = ti % 2 === 0 ? "first" : "second";
            mockEntries.push({
              id: `entry_${ti}_${di}_${pi}`,
              teacherId: teacher._id,
              teacherName: teacher.name,
              classId: cls._id,
              className: cls.className,
              subjectId: subj._id,
              subjectName: subj.name,
              subjectCode: subj.code,
              day: day,
              startTime: `${8 + period}:00`,
              endTime: `${8 + period + 1}:00`,
              periodNumber: period,
              cycle: cycle as "first" | "second",
              ratePerPeriod: cycle === "first" ? 500 : 700,
              room: `Room ${Math.floor(Math.random() * 10) + 1}`,
              academicYear: "2024-2025",
              isActive: true
            });
          }
        });
      });
    });

    return { teachers: mockTeachers, classes: mockClasses, subjects: mockSubjects, entries: mockEntries };
  };

  // ============================================
  // FETCH DATA - FIXED
  // ============================================

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Try to fetch from API
      try {
        const [timetableRes, teachersRes, classesRes, subjectsRes] = await Promise.all([
          axios.get(`${API_BASE}/timetable`).catch(() => ({ data: { success: false } })),
          axios.get(`${API_BASE}/users?role=teacher`).catch(() => ({ data: { success: false } })),
          axios.get(`${API_BASE}/classes`).catch(() => ({ data: { success: false } })),
          axios.get(`${API_BASE}/subjects`).catch(() => ({ data: { success: false } }))
        ]);

        const apiSuccess = timetableRes.data.success || teachersRes.data.success || classesRes.data.success || subjectsRes.data.success;
        
        if (apiSuccess) {
          setIsOnline(true);
          setApiError(null);
          
          // Map timetable entries
          if (timetableRes.data.success && timetableRes.data.data.length > 0) {
            const mappedEntries = timetableRes.data.data.map(mapApiEntry);
            setEntries(mappedEntries);
            saveToLocalStorage('entries', mappedEntries);
            calculateStats(mappedEntries);
          }

          if (teachersRes.data.success && teachersRes.data.data.length > 0) {
            setTeachers(teachersRes.data.data);
            saveToLocalStorage('teachers', teachersRes.data.data);
          }

          if (classesRes.data.success && classesRes.data.data.length > 0) {
            setClasses(classesRes.data.data);
            saveToLocalStorage('classes', classesRes.data.data);
          }

          if (subjectsRes.data.success && subjectsRes.data.data.length > 0) {
            setSubjects(subjectsRes.data.data);
            saveToLocalStorage('subjects', subjectsRes.data.data);
          }
        } else {
          // Load from cache or generate mock
          loadFromCache();
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        setApiError("API server error. Using local data.");
        setIsOnline(false);
        loadFromCache();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsOnline(false);
      loadFromCache();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromCache = () => {
    const cachedEntries = loadFromLocalStorage('entries');
    const cachedTeachers = loadFromLocalStorage('teachers');
    const cachedClasses = loadFromLocalStorage('classes');
    const cachedSubjects = loadFromLocalStorage('subjects');

    if (cachedEntries && cachedEntries.length > 0) {
      setEntries(cachedEntries);
      setTeachers(cachedTeachers || []);
      setClasses(cachedClasses || []);
      setSubjects(cachedSubjects || []);
      calculateStats(cachedEntries);
      toast.info("Using cached data");
    } else {
      const mockData = generateMockData();
      setEntries(mockData.entries);
      setTeachers(mockData.teachers);
      setClasses(mockData.classes);
      setSubjects(mockData.subjects);
      calculateStats(mockData.entries);
      saveToLocalStorage('entries', mockData.entries);
      saveToLocalStorage('teachers', mockData.teachers);
      saveToLocalStorage('classes', mockData.classes);
      saveToLocalStorage('subjects', mockData.subjects);
      toast.info("Using demo data");
    }
  };

  const calculateStats = (entries: TimetableEntry[]) => {
    const firstCycle = entries.filter(e => e.cycle === "first").length;
    const secondCycle = entries.filter(e => e.cycle === "second").length;
    const totalPotential = entries.reduce((sum, e) => sum + e.ratePerPeriod, 0);
    
    setStats({
      totalPeriods: entries.length,
      totalTeachers: new Set(entries.map(e => e.teacherId)).size,
      totalClasses: new Set(entries.map(e => e.classId)).size,
      totalPotential,
      firstCyclePeriods: firstCycle,
      secondCyclePeriods: secondCycle
    });
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ============================================
  // FILTERS & SEARCH
  // ============================================

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.teacherName.toLowerCase().includes(term) ||
        e.className.toLowerCase().includes(term) ||
        e.subjectName.toLowerCase().includes(term) ||
        (e.subjectCode && e.subjectCode.toLowerCase().includes(term))
      );
    }

    if (selectedTeacher) {
      filtered = filtered.filter(e => e.teacherId === selectedTeacher);
    }

    if (selectedClass) {
      filtered = filtered.filter(e => e.classId === selectedClass);
    }

    if (selectedDay) {
      filtered = filtered.filter(e => e.day === selectedDay);
    }

    if (selectedCycle) {
      filtered = filtered.filter(e => e.cycle === selectedCycle);
    }

    return filtered;
  }, [entries, searchTerm, selectedTeacher, selectedClass, selectedDay, selectedCycle]);

  // ============================================
  // CRUD OPERATIONS - FIXED
  // ============================================

  const syncToAPI = async (method: string, url: string, data?: any) => {
    try {
      const response = await axios({ method, url, data });
      return response.data;
    } catch (error) {
      console.error("API sync failed:", error);
      return null;
    }
  };

  const handleSaveEntry = async (entry: TimetableEntry) => {
    try {
      if (!entry.teacherId || !entry.classId || !entry.subjectId) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Check for conflicts
      const conflict = entries.find(e =>
        e.teacherId === entry.teacherId &&
        e.day === entry.day &&
        e.startTime === entry.startTime &&
        e.id !== entry.id
      );

      if (conflict) {
        toast.error(`Teacher already has a period at this time on ${entry.day}`);
        return;
      }

      let updatedEntries;
      const isExisting = entries.some(e => e.id === entry.id);

      // Prepare data for API
      const apiData = mapForApi(entry);

      if (isExisting) {
        // Update existing
        const existingEntry = entries.find(e => e.id === entry.id);
        const apiId = existingEntry?._id || existingEntry?.id;
        
        updatedEntries = entries.map(e => e.id === entry.id ? entry : e);
        await syncToAPI('PUT', `${API_BASE}/timetable/${apiId}`, apiData);
        toast.success("Timetable entry updated");
      } else {
        // Create new
        const newEntry = { ...entry, id: `entry_${Date.now()}` };
        updatedEntries = [...entries, newEntry];
        const result = await syncToAPI('POST', `${API_BASE}/timetable`, apiData);
        // If API returns with _id, update the entry with it
        if (result && result.data && result.data._id) {
          const updatedEntry = { ...newEntry, _id: result.data._id, id: result.data._id };
          updatedEntries = updatedEntries.map(e => e.id === newEntry.id ? updatedEntry : e);
        }
        toast.success("Timetable entry added");
      }

      setEntries(updatedEntries);
      calculateStats(updatedEntries);
      saveToLocalStorage('entries', updatedEntries);
      setEditingEntry(null);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error saving timetable:", error);
      toast.error("Failed to save entry");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this timetable entry?")) return;

    try {
      const entryToDelete = entries.find(e => e.id === id);
      const apiId = entryToDelete?._id || entryToDelete?.id;
      
      if (apiId) {
        await syncToAPI('DELETE', `${API_BASE}/timetable/${apiId}`);
      }
      
      const updatedEntries = entries.filter(e => e.id !== id);
      setEntries(updatedEntries);
      calculateStats(updatedEntries);
      saveToLocalStorage('entries', updatedEntries);
      toast.success("Timetable entry deleted");
    } catch (error) {
      console.error("Error deleting timetable:", error);
      // Delete locally anyway
      const updatedEntries = entries.filter(e => e.id !== id);
      setEntries(updatedEntries);
      calculateStats(updatedEntries);
      saveToLocalStorage('entries', updatedEntries);
      toast.warning("Deleted locally (API sync failed)");
    }
  };

  const handleBulkAdd = async (newEntries: TimetableEntry[]) => {
    try {
      const validEntries = newEntries.filter(e => e.teacherId && e.classId && e.subjectId);
      if (validEntries.length === 0) {
        toast.error("No valid entries to add");
        return;
      }

      const apiData = validEntries.map(mapForApi);
      const result = await syncToAPI('POST', `${API_BASE}/timetable/bulk`, { entries: apiData });
      
      // Map back with IDs if API returned data
      let updatedEntries = [...entries, ...validEntries];
      if (result && result.data && result.data.entries) {
        const apiEntries = result.data.entries;
        updatedEntries = entries;
        validEntries.forEach((entry, index) => {
          if (apiEntries[index] && apiEntries[index]._id) {
            updatedEntries.push({ ...entry, _id: apiEntries[index]._id, id: apiEntries[index]._id });
          } else {
            updatedEntries.push(entry);
          }
        });
      } else {
        updatedEntries = [...entries, ...validEntries];
      }

      setEntries(updatedEntries);
      calculateStats(updatedEntries);
      saveToLocalStorage('entries', updatedEntries);
      toast.success(`${validEntries.length} entries added successfully`);
      setShowBulkModal(false);
    } catch (error) {
      console.error("Error bulk adding timetable:", error);
      toast.error("Failed to add entries");
    }
  };

  const handleCopyFromPrevious = async (sourceYear: string, targetYear: string) => {
    try {
      const sourceEntries = entries.filter(e => e.academicYear === sourceYear);
      if (sourceEntries.length === 0) {
        toast.error("No entries found for the source year");
        return;
      }

      const copiedEntries = sourceEntries.map(e => ({
        ...e,
        id: `entry_${Date.now()}_${Math.random()}`,
        academicYear: targetYear,
        isActive: true
      }));

      const apiData = copiedEntries.map(mapForApi);
      const result = await syncToAPI('POST', `${API_BASE}/timetable/bulk`, { entries: apiData });

      let updatedEntries = [...entries, ...copiedEntries];
      if (result && result.data && result.data.entries) {
        const apiEntries = result.data.entries;
        updatedEntries = entries;
        copiedEntries.forEach((entry, index) => {
          if (apiEntries[index] && apiEntries[index]._id) {
            updatedEntries.push({ ...entry, _id: apiEntries[index]._id, id: apiEntries[index]._id });
          } else {
            updatedEntries.push(entry);
          }
        });
      } else {
        updatedEntries = [...entries, ...copiedEntries];
      }

      setEntries(updatedEntries);
      calculateStats(updatedEntries);
      saveToLocalStorage('entries', updatedEntries);
      toast.success(`${copiedEntries.length} entries copied to ${targetYear}`);
      setShowCopyModal(false);
    } catch (error) {
      console.error("Error copying timetable:", error);
      toast.error("Failed to copy entries");
    }
  };

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  const exportToCSV = () => {
    const headers = ["Day", "Start Time", "End Time", "Teacher", "Class", "Subject", "Cycle", "Rate", "Room"];
    const rows = filteredEntries.map(e => [
      e.day,
      e.startTime,
      e.endTime,
      e.teacherName,
      e.className,
      e.subjectName,
      e.cycle === "first" ? "1st Cycle" : "2nd Cycle",
      e.ratePerPeriod.toString(),
      e.room || ""
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetable_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Timetable exported as CSV");
  };

  const exportToPDF = () => {
    window.print();
  };

  // ============================================
  // RENDER FUNCTIONS
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
      {/* API Error / Offline mode indicator */}
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
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand/20 text-brand text-sm font-semibold hover:bg-brand/5 transition-all"
          >
            <Upload className="size-4" /> Bulk Add
          </button>
          <button
            onClick={() => setShowCopyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand/20 text-brand text-sm font-semibold hover:bg-brand/5 transition-all"
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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
          >
            <Plus className="size-4" /> Add Period
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Total Periods</p>
          <p className="text-2xl font-bold mt-1">{stats.totalPeriods}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Teachers</p>
          <p className="text-2xl font-bold mt-1">{stats.totalTeachers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Classes</p>
          <p className="text-2xl font-bold mt-1">{stats.totalClasses}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-xs text-black/40 font-medium uppercase tracking-wider">1st Cycle</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.firstCyclePeriods}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <p className="text-xs text-black/40 font-medium uppercase tracking-wider">2nd Cycle</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.secondCyclePeriods}</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand/20 p-4 bg-brand/5">
          <p className="text-xs text-brand/60 font-medium uppercase tracking-wider">Potential Revenue</p>
          <p className="text-2xl font-bold text-brand mt-1">{stats.totalPotential.toLocaleString()} FRS</p>
        </div>
      </div>

      {/* Filters - Keep the same */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* ... filters remain the same ... */}
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
          {teachers.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[150px]"
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.className}</option>
          ))}
        </select>

        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand min-w-[130px]"
        >
          <option value="">All Days</option>
          {days.map(d => (
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

        {(selectedTeacher || selectedClass || selectedDay || selectedCycle || searchTerm) && (
          <button
            onClick={() => {
              setSelectedTeacher("");
              setSelectedClass("");
              setSelectedDay("");
              setSelectedCycle("");
              setSearchTerm("");
            }}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm hover:bg-stone-50 transition whitespace-nowrap"
          >
            <X className="size-4 inline mr-1" /> Clear
          </button>
        )}
      </div>

      {/* View Content */}
      {viewMode === "table" && (
        <TableView
          entries={filteredEntries}
          onEdit={(entry) => setEditingEntry(entry)}
          onDelete={handleDeleteEntry}
          canEdit={true}
        />
      )}

      {viewMode === "grid" && (
        <GridView
          entries={filteredEntries}
          onEdit={(entry) => setEditingEntry(entry)}
          onDelete={handleDeleteEntry}
        />
      )}

      {viewMode === "calendar" && (
        <CalendarView
          entries={filteredEntries}
          days={days}
          onEdit={(entry) => setEditingEntry(entry)}
        />
      )}

      {/* Modals */}
      {(showAddModal || editingEntry) && (
        <TimetableEntryModal
          initial={editingEntry || {
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
            ratePerPeriod: 500,
            room: "",
            academicYear: academicYear,
            isActive: true
          }}
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          onSave={handleSaveEntry}
          onCancel={() => {
            setEditingEntry(null);
            setShowAddModal(false);
          }}
        />
      )}

      {showBulkModal && (
        <BulkAddModal
          teachers={teachers}
          classes={classes}
          subjects={subjects}
          days={days}
          onSave={handleBulkAdd}
          onCancel={() => setShowBulkModal(false)}
        />
      )}

      {showCopyModal && (
        <CopyYearModal
          currentYear={academicYear}
          onCopy={handleCopyFromPrevious}
          onCancel={() => setShowCopyModal(false)}
        />
      )}
    </div>
  );
}

// ... rest of the components (TableView, GridView, CalendarView, TimetableEntryModal, BulkAddModal, CopyYearModal, Field) remain the same as before ...

// ============================================
// TABLE VIEW
// ============================================

function TableView({ entries, onEdit, onDelete, canEdit }: {
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}) {
  // ... (same as before)
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
                      {entry.subjectName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      entry.cycle === "first" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {entry.cycle === "first" ? "1st Cycle" : "2nd Cycle"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-brand">{entry.ratePerPeriod} FRS</td>
                  <td className="px-4 py-3 text-sm">{entry.room || "-"}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(entry)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-black/60 transition"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                        >
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
          <span>Academic Year: {entries[0]?.academicYear || "2024-2025"}</span>
        </div>
      )}
    </div>
  );
}

// ... GridView, CalendarView, TimetableEntryModal, BulkAddModal, CopyYearModal, Field helper remain the same as before ...

// ============================================
// GRID VIEW
// ============================================

function GridView({ entries, onEdit, onDelete }: {
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
            {/* ... same as before ... */}
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
                <button
                  onClick={() => onEdit(entry)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-black/60 transition"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                >
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
                <span>{entry.subjectName}</span>
              </div>
              {entry.room && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-black/40">Room:</span>
                  <span>{entry.room}</span>
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                entry.cycle === "first" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-purple-100 text-purple-700"
              }`}>
                {entry.cycle === "first" ? "1st Cycle" : "2nd Cycle"}
              </span>
              <span className="font-bold text-brand">{entry.ratePerPeriod} FRS/period</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ... CalendarView, TimetableEntryModal, BulkAddModal, CopyYearModal, Field helper remain the same ...

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