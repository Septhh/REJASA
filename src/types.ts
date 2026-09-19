export type LabCode = 'BIO' | 'FIS' | 'KIM' | 'COM' | 'BSM';

export type Role = 'ADMIN' | 'LABORAN' | 'GURU';

export interface AuthUser {
  id: number;
  code: string;
  name: string;
  role: Role;
}

export interface Lab {
  id: number;
  code: string;
  roomCode: string;
  name: string;
  school: string;
}

export type JournalStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'NEEDS_CORRECTION';

export interface JournalReview {
  id: number;
  journalId: number;
  reviewerId: number;
  reviewerName: string;
  reviewerRole: Role;
  status: 'SUBMITTED' | 'REVIEWED' | 'NEEDS_CORRECTION';
  notes: string;
  sopComplied: boolean | null;
  createdAt: string;
}

export interface ScheduleItem {
  scheduleId: number;
  date: string;
  dayName: string;
  isToday: boolean;
  startTime: string;
  endTime: string;
  className: string;
  activity: string;
  subject: string;
  isMine: boolean;
}

export interface QRCodeInfo {
  id: number;
  token: string;
  labId: number;
  labCode: string;
  labName: string;
  createdAt: string;
  url: string;
}

export interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: 'ALAT' | 'REAGEN' | 'BAHAN';
  labId: number | null;
  labCode: string | null;
  quantity: number;
  minStock: number;
  condition: 'BAIK' | 'PERLU_PERBAIKAN' | 'RUSAK';
  storageLocation: string;
  unitValue: number;
}

export type RoomStatus = 'Insiden' | 'Berjalan' | 'Praktikum' | 'Standby' | 'Sterilisasi';

export interface LabRoom {
  id: string;
  code: string;
  badgeCode: string;
  badgeBg: string;
  badgeColor: string;
  name: string;
  status: RoomStatus;
  statusType: 'problem' | 'reviewed' | 'active' | 'standby';
  className?: string;
  topic?: string;
  teacher?: string;
  statusDetail: string;
  statusDetailType: 'problem' | 'success' | 'timer' | 'info';
  actionLabel?: string;
  workstations?: number;
}

export interface JournalEntry {
  id: string;
  code: string;
  session: string;
  time: string;
  labCode: string;
  labName: string;
  teacherName: string;
  teacherInitials: string;
  teacherAvatarColor: string;
  className: string;
  topic: string;
  status: JournalStatus;
  notes?: string;
  studentsCount: number;
  sopComplied: boolean;
  incidentReported?: string;
  // Field tambahan dari backend
  date?: string;
  startTime?: string;
  endTime?: string;
  labId?: number;
  teacherId?: number;
  teacherCode?: string;
  subject?: string;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string | null;
  reviews?: JournalReview[];
}

export interface IncidentItem {
  id: string;
  assetCode: string;
  time: string;
  title: string;
  description: string;
  reporter: string;
  className: string;
  labCode: string;
  photoUrl: string;
  photoAlt: string;
  status: 'Open' | 'Disposed' | 'Resolved';
  actionType: 'repair' | 'scrap';
  actionLabel: string;
}

export interface LabUsageStat {
  labName: string;
  sessions: number;
  percentage: number;
  color: string;
}

export interface DayAllocation {
  day: string;
  hours: number;
  isToday?: boolean;
  details: string;
}
