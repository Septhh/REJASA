export type LabCode = 'BIO' | 'FIS' | 'KIM' | 'COM' | 'BSM';

export type JournalStatus = 'DRAFT' | 'NEEDS_CORRECTION' | 'SUBMITTED' | 'REVIEWED';

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
  labCode: LabCode;
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
}

export interface IncidentItem {
  id: string;
  assetCode: string;
  time: string;
  title: string;
  description: string;
  reporter: string;
  className: string;
  labCode: LabCode;
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
