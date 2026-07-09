import { useState, useEffect, useCallback } from "react";
import { 
  Calendar, Clock, Users, Search, X, CalendarDays, 
  User, BookOpen, ChevronLeft, ChevronRight, 
  AlertCircle, Check, Home, LogOut, Menu, 
  Sun, Moon, Settings, Bell, Award, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API_BASE = "https://belmon-back.onrender.com/api";

// ============================================
// TYPES
// ============================================

interface TimetableEntry {
  id: string;
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
  id: string;
  name: string;
  email: string;
  username: string;
  qualification: string;
  role: string;
}

interface TeacherStats {
  totalPeriods: number;
  firstCyclePeriods: number;
  secondCyclePeriods: number;
  totalPotentialEarnings: number;
  days: string[];
}

interface TimetableData {
  teacher: Teacher;
  stats: TeacherStats;
  timetable: TimetableEntry[];
  groupedByDay: Record<string, TimetableEntry[]>;
  totalEntries: number;
}

interface WeeklyData {
  teacher: Teacher;
  currentDay: string;
  todaySchedule: TimetableEntry[];
  upcomingToday: TimetableEntry[];
  nextPeriod: TimetableEntry | null;
  weeklySchedule: TimetableEntry[];
  stats: {
    totalPeriods: number;
    todayPeriods: number;
    remainingToday: number;
  };
}

// ============================================
// TEACHER TIMETABLE VIEW
// ============================================

export function TeacherTimetableView() {
  const [loading, setLoading] = useState(true);
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [daySchedule, setDaySchedule] = useState<TimetableEntry[]>([]);
  const [viewMode, setViewMode] = useState<"weekly" | "daily" | "today">("today");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get logged in user from localStorage
  const getLoggedInUser = () => {
    try {
      const userStr = localStorage.getItem('mams-user') || localStorage.getItem('belmon-user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      // Fallback - check for user in localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  const user = getLoggedInUser();

  // ============================================
  // FETCH TIMETABLE
  // ============================================

  const fetchTeacherTimetable = useCallback(async () => {
    if (!user) {
      toast.error('Please login first');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get teacher ID or username
      const teacherId = user.id || user._id;
      const username = user.username || user.name;
      const email = user.email;

      // Build query params
      let queryParams = '';
      if (teacherId) {
        queryParams = `teacherId=${teacherId}`;
      } else if (username) {
        queryParams = `username=${encodeURIComponent(username)}`;
      } else if (email) {
        queryParams = `email=${encodeURIComponent(email)}`;
      }

      // Fetch timetable
      const response = await axios.get(`${API_BASE}/teacher/timetable?${queryParams}`);
      
      if (response.data.success) {
        setTimetableData(response.data.data);
        setWeeklyData(null);
        setSelectedDay('');
        setDaySchedule([]);
        toast.success('Timetable loaded successfully');
      } else {
        toast.error(response.data.message || 'Failed to load timetable');
        // Load mock data as fallback
        loadMockData();
      }
    } catch (error: any) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable. Loading demo data...');
      // Load mock data as fallback
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch weekly schedule
  const fetchWeeklySchedule = useCallback(async () => {
    if (!user) return;

    try {
      const teacherId = user.id || user._id;
      const username = user.username || user.name;
      const email = user.email;

      let queryParams = '';
      if (teacherId) {
        queryParams = `teacherId=${teacherId}`;
      } else if (username) {
        queryParams = `username=${encodeURIComponent(username)}`;
      } else if (email) {
        queryParams = `email=${encodeURIComponent(email)}`;
      }

      const response = await axios.get(`${API_BASE}/teacher/weekly?${queryParams}`);
      
      if (response.data.success) {
        setWeeklyData(response.data.data);
        toast.success('Weekly schedule loaded');
      }
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
    }
  }, [user]);

  // Fetch day schedule
  const fetchDaySchedule = useCallback(async (day: string) => {
    if (!user || !day) return;

    try {
      const teacherId = user.id || user._id;
      const username = user.username || user.name;
      const email = user.email;

      let queryParams = '';
      if (teacherId) {
        queryParams = `teacherId=${teacherId}`;
      } else if (username) {
        queryParams = `username=${encodeURIComponent(username)}`;
      } else if (email) {
        queryParams = `email=${encodeURIComponent(email)}`;
      }

      const response = await axios.get(`${API_BASE}/teacher/schedule/${day}?${queryParams}`);
      
      if (response.data.success) {
        setDaySchedule(response.data.data.schedule || []);
        setSelectedDay(day);
        toast.success(`Schedule for ${day} loaded`);
      }
    } catch (error) {
      console.error('Error fetching day schedule:', error);
    }
  }, [user]);

  // ============================================
  // MOCK DATA (Fallback)
  // ============================================

  const loadMockData = () => {
    const mockTeacher: Teacher = {
      id: 't1',
      name: user?.name || 'John Doe',
      email: user?.email || 'john@school.com',
      username: user?.username || 'john_doe',
      qualification: 'BSc Mathematics',
      role: 'teacher'
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const mockEntries: TimetableEntry[] = [];
    const periods = [1, 2, 3, 4, 5];
    const classes = ['Form 4 Science A', 'Form 5 Science A', 'Form 3 Arts'];
    const subjects = [
      { name: 'Mathematics', code: 'MATH' },
      { name: 'Physics', code: 'PHY' },
      { name: 'Chemistry', code: 'CHEM' }
    ];

    days.forEach((day, di) => {
      periods.forEach((period, pi) => {
        if (Math.random() > 0.4) {
          const cycle = pi % 2 === 0 ? 'first' : 'second';
          mockEntries.push({
            id: `mock_${di}_${pi}`,
            teacherId: mockTeacher.id,
            teacherName: mockTeacher.name,
            classId: `c${pi % 3 + 1}`,
            className: classes[pi % 3],
            subjectId: `s${pi % 3 + 1}`,
            subjectName: subjects[pi % 3].name,
            subjectCode: subjects[pi % 3].code,
            day: day,
            startTime: `${8 + period}:00`,
            endTime: `${8 + period + 1}:00`,
            periodNumber: period,
            cycle: cycle as 'first' | 'second',
            ratePerPeriod: cycle === 'first' ? 500 : 700,
            room: `Room ${Math.floor(Math.random() * 8) + 1}`,
            academicYear: '2024-2025',
            isActive: true
          });
        }
      });
    });

    const groupedByDay: Record<string, TimetableEntry[]> = {};
    days.forEach(day => {
      groupedByDay[day] = mockEntries.filter(e => e.day === day);
    });

    const stats: TeacherStats = {
      totalPeriods: mockEntries.length,
      firstCyclePeriods: mockEntries.filter(e => e.cycle === 'first').length,
      secondCyclePeriods: mockEntries.filter(e => e.cycle === 'second').length,
      totalPotentialEarnings: mockEntries.reduce((sum, e) => sum + e.ratePerPeriod, 0),
      days: days
    };

    setTimetableData({
      teacher: mockTeacher,
      stats: stats,
      timetable: mockEntries,
      groupedByDay: groupedByDay,
      totalEntries: mockEntries.length
    });
  };

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (user) {
      fetchTeacherTimetable();
    } else {
      // For demo, load mock data
      loadMockData();
      setLoading(false);
    }
  }, [user]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-black/60 font-medium">Loading your timetable...</p>
        </div>
      </div>
    );
  }

  const data = timetableData;
  if (!data) {
    return (
      <div className="text-center py-12">
        <Calendar className="size-16 mx-auto text-black/20 mb-4" />
        <p className="text-black/60">No timetable data available</p>
        <button 
          onClick={fetchTeacherTimetable}
          className="mt-4 btn-primary text-sm"
        >
          Refresh
        </button>
      </div>
    );
  }

  const { teacher, stats, groupedByDay } = data;

  return (
    <div className="space-y-6">
      {/* Teacher Profile Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-2xl font-bold text-brand">
            {teacher.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{teacher.name}</h2>
            <p className="text-sm text-black/60">{teacher.qualification || 'Teacher'}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-black/60">
              <span><User className="size-4 inline mr-1" /> {teacher.username || teacher.email}</span>
              <span><BookOpen className="size-4 inline mr-1" /> {stats.totalPeriods} periods</span>
              <span><DollarSign className="size-4 inline mr-1 text-brand" /> {stats.totalPotentialEarnings.toLocaleString()} FRS potential</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setViewMode('today'); fetchWeeklySchedule(); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${viewMode === 'today' ? 'bg-brand text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              Today
            </button>
            <button 
              onClick={() => { setViewMode('weekly'); fetchWeeklySchedule(); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${viewMode === 'weekly' ? 'bg-brand text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${viewMode === 'daily' ? 'bg-brand text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              Daily
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card p-4">
          <p className="text-xs text-black/40 font-medium uppercase">Total Periods</p>
          <p className="text-2xl font-bold mt-1">{stats.totalPeriods}</p>
        </div>
        <div className="stat-card p-4">
          <p className="text-xs text-black/40 font-medium uppercase">1st Cycle</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.firstCyclePeriods}</p>
        </div>
        <div className="stat-card p-4">
          <p className="text-xs text-black/40 font-medium uppercase">2nd Cycle</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.secondCyclePeriods}</p>
        </div>
        <div className="stat-card p-4 border-brand/20 bg-brand/5">
          <p className="text-xs text-brand/60 font-medium uppercase">Potential Earnings</p>
          <p className="text-2xl font-bold text-brand mt-1">{stats.totalPotentialEarnings.toLocaleString()} FRS</p>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'today' && (
        <TodayView 
          weeklyData={weeklyData} 
          groupedByDay={groupedByDay}
          currentDay={weeklyData?.currentDay || new Date().toLocaleString('en-US', { weekday: 'long' })}
        />
      )}

      {viewMode === 'weekly' && (
        <WeeklyView 
          groupedByDay={groupedByDay} 
          onDayClick={(day) => { setSelectedDay(day); fetchDaySchedule(day); }}
        />
      )}

      {viewMode === 'daily' && (
        <DailyView 
          selectedDay={selectedDay}
          daySchedule={daySchedule}
          groupedByDay={groupedByDay}
          onDaySelect={fetchDaySchedule}
        />
      )}
    </div>
  );
}

// ============================================
// TODAY VIEW
// ============================================

function TodayView({ weeklyData, groupedByDay, currentDay }: { 
  weeklyData: WeeklyData | null; 
  groupedByDay: Record<string, TimetableEntry[]>;
  currentDay: string;
}) {
  const todaySchedule = weeklyData?.todaySchedule || groupedByDay[currentDay] || [];
  const upcomingToday = weeklyData?.upcomingToday || [];
  const nextPeriod = weeklyData?.nextPeriod || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calendar className="size-5 text-brand" />
          Today's Schedule - {currentDay}
        </h3>
        <span className="text-sm text-black/60">{todaySchedule.length} periods</span>
      </div>

      {nextPeriod && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">Next Period</p>
            <p className="font-bold">{nextPeriod.subjectName} - {nextPeriod.className}</p>
            <p className="text-sm text-green-600">{nextPeriod.startTime} - {nextPeriod.endTime}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-700">Room {nextPeriod.room}</p>
            <span className="badge badge-success">{nextPeriod.cycle === 'first' ? '1st Cycle' : '2nd Cycle'}</span>
          </div>
        </div>
      )}

      {todaySchedule.length === 0 ? (
        <div className="text-center py-8 text-black/40">
          <CalendarDays className="size-12 mx-auto text-black/20 mb-3" />
          <p>No classes scheduled for today</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todaySchedule.map((entry) => (
            <div key={entry.id} className={`p-4 rounded-xl border ${entry.cycle === 'first' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{entry.subjectName} {entry.subjectCode && `(${entry.subjectCode})`}</p>
                  <p className="text-sm text-black/60">{entry.className}</p>
                  <p className="text-sm text-black/60"><Clock className="size-3 inline mr-1" />{entry.startTime} - {entry.endTime}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${entry.cycle === 'first' ? 'badge-blue' : 'badge-purple'}`}>
                    {entry.cycle === 'first' ? '1st Cycle' : '2nd Cycle'}
                  </span>
                  <p className="text-sm font-bold text-brand mt-1">{entry.ratePerPeriod} FRS</p>
                  {entry.room && <p className="text-xs text-black/40">Room {entry.room}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {upcomingToday.length > 0 && (
        <div className="bg-stone-50 rounded-xl p-4">
          <p className="text-sm font-medium text-black/60">Remaining today: {upcomingToday.length} periods</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// WEEKLY VIEW
// ============================================

function WeeklyView({ groupedByDay, onDayClick }: { 
  groupedByDay: Record<string, TimetableEntry[]>;
  onDayClick: (day: string) => void;
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <CalendarDays className="size-5 text-brand" />
        Weekly Schedule
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(day => {
          const dayEntries = groupedByDay[day] || [];
          const totalEarnings = dayEntries.reduce((sum, e) => sum + e.ratePerPeriod, 0);
          const isToday = day === new Date().toLocaleString('en-US', { weekday: 'long' });

          return (
            <div 
              key={day}
              onClick={() => onDayClick(day)}
              className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 ${isToday ? 'border-brand shadow-md' : 'border-stone-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  {day}
                  {isToday && <span className="text-xs bg-brand text-white px-2 py-0.5 rounded-full">Today</span>}
                </h4>
                <span className="text-sm text-black/40">{dayEntries.length} periods</span>
              </div>
              
              {dayEntries.length === 0 ? (
                <p className="text-sm text-black/40">No classes</p>
              ) : (
                <div className="space-y-2">
                  {dayEntries.slice(0, 3).map(entry => (
                    <div key={entry.id} className="text-sm flex items-center justify-between border-b border-stone-100 pb-1 last:border-0">
                      <span>{entry.subjectName}</span>
                      <span className="text-black/60">{entry.startTime}</span>
                    </div>
                  ))}
                  {dayEntries.length > 3 && (
                    <p className="text-xs text-black/40">+{dayEntries.length - 3} more</p>
                  )}
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-black/40">Earnings</span>
                <span className="font-bold text-brand">{totalEarnings.toLocaleString()} FRS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// DAILY VIEW
// ============================================

function DailyView({ 
  selectedDay, 
  daySchedule, 
  groupedByDay,
  onDaySelect 
}: { 
  selectedDay: string;
  daySchedule: TimetableEntry[];
  groupedByDay: Record<string, TimetableEntry[]>;
  onDaySelect: (day: string) => void;
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [currentDay, setCurrentDay] = useState(selectedDay || days[0]);

  const handleDaySelect = (day: string) => {
    setCurrentDay(day);
    onDaySelect(day);
  };

  const entries = daySchedule.length > 0 ? daySchedule : groupedByDay[currentDay] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calendar className="size-5 text-brand" />
          Daily Schedule
        </h3>
        <div className="flex gap-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => handleDaySelect(day)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${currentDay === day ? 'bg-brand text-white' : 'bg-stone-100 hover:bg-stone-200'}`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 text-black/40">
          <CalendarDays className="size-12 mx-auto text-black/20 mb-3" />
          <p>No classes scheduled for {currentDay}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase">Cycle</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-black/50 uppercase">Room</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm">{entry.periodNumber}</td>
                    <td className="px-4 py-3 text-sm">{entry.startTime} - {entry.endTime}</td>
                    <td className="px-4 py-3 text-sm font-medium">{entry.subjectName}</td>
                    <td className="px-4 py-3 text-sm">{entry.className}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${entry.cycle === 'first' ? 'badge-blue' : 'badge-purple'}`}>
                        {entry.cycle === 'first' ? '1st Cycle' : '2nd Cycle'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-brand">{entry.ratePerPeriod} FRS</td>
                    <td className="px-4 py-3 text-sm">{entry.room || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-stone-200 text-sm text-black/40 flex justify-between">
            <span>Total: {entries.length} periods</span>
            <span>Earnings: {entries.reduce((sum, e) => sum + e.ratePerPeriod, 0).toLocaleString()} FRS</span>
          </div>
        </div>
      )}
    </div>
  );
}