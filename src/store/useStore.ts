import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentAcademicYear } from '@/lib/data';

export interface ClassData { id: string; name: string; year: string; }
export interface StudentData { id: string; nis: string; nisn?: string; name: string; classId: string; }
export interface WeeklyScore { studentId: string; classId: string; semester: number; weeks: number; [key: string]: any; }
export interface SASScore { studentId: string; classId: string; semester: number; pg?: number | string; isian?: number | string; uraian?: number | string; nonTes?: number | string; tes?: number | string; score: number | string; }
export interface PracticeScore { studentId: string; classId: string; wudhu: any; quran: any; sholat: any; tayamum: any; }
export interface ASAJScore { studentId: string; pg: number | string; essay: number | string; }

export interface AttendanceNote {
  studentId: string;
  classId: string;
  semester: number;
  s?: number | string; // Sakit
  i?: number | string; // Izin
  a?: number | string; // Alpa
  notes?: string;      // Saran-saran
}

interface AppState {
  classes: ClassData[];
  students: StudentData[];
  weeklyScores: WeeklyScore[];
  sasScores: SASScore[];
  practiceScores: PracticeScore[];
  asajScores: ASAJScore[];
  attendanceNotes: AttendanceNote[];
  activeYear: string;
  setClasses: (updater: (prev: ClassData[]) => ClassData[]) => void;
  setStudents: (updater: (prev: StudentData[]) => StudentData[]) => void;
  setWeeklyScores: (updater: (prev: WeeklyScore[]) => WeeklyScore[]) => void;
  setSASScores: (updater: (prev: SASScore[]) => SASScore[]) => void;
  setPracticeScores: (updater: (prev: PracticeScore[]) => PracticeScore[]) => void;
  setASAJScores: (updater: (prev: ASAJScore[]) => ASAJScore[]) => void;
  setAttendanceNotes: (updater: (prev: AttendanceNote[]) => AttendanceNote[]) => void;
  setActiveYear: (year: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      classes: [],
      students: [],
      weeklyScores: [],
      sasScores: [],
      practiceScores: [],
      asajScores: [],
      attendanceNotes: [],
      activeYear: getCurrentAcademicYear(),
      setClasses: (updater) => set((state) => ({ classes: updater(state.classes) })),
      setStudents: (updater) => set((state) => ({ students: updater(state.students) })),
      setWeeklyScores: (updater) => set((state) => ({ weeklyScores: updater(state.weeklyScores) })),
      setSASScores: (updater) => set((state) => ({ sasScores: updater(state.sasScores) })),
      setPracticeScores: (updater) => set((state) => ({ practiceScores: updater(state.practiceScores) })),
      setASAJScores: (updater) => set((state) => ({ asajScores: updater(state.asajScores) })),
      setAttendanceNotes: (updater) => set((state) => ({ attendanceNotes: updater(state.attendanceNotes) })),
      setActiveYear: (year) => set({ activeYear: year }),
    }),
    { name: 'paibp_store' }
  )
);
