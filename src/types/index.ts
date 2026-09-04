export type CountryCode = 'sa' | 'eg' | 'ae' | 'kw' | 'jo' | 'qa' | 'om' | 'bh' | 'dz' | 'ma' | 'iq' | 'general';

export interface CountryInfo {
  code: CountryCode;
  id?: CountryCode;
  name: string;
  shortName: string;
  demonym: string;
  flag: string;
  description?: string;
  activeCurriculumsCount?: number;
  vision: string;
  mission: string;
  examHighlight: string;
  examTagline: string;
  academicYear: string;
  isActive?: boolean;
}

export type StageType = 'elementary' | 'middle' | 'secondary' | 'primary' | 'general';

export interface StageInfo {
  id: StageType;
  name: string;
  description: string;
  iconName: string;
  color: string;
  gradesCount: number;
  country?: CountryCode;
}

export interface GradeInfo {
  id: string;
  name: string;
  stage: StageType;
  gradeNumber: number;
  stageNameAr: string;
  description: string;
  iconName: string;
  country?: CountryCode;
}

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  stage: StageType;
  grades: number[];
  color: string;
  iconName: string;
  description: string;
  term?: 'term1' | 'term2' | 'term3';
  country?: CountryCode;
}

export interface Question {
  id: string;
  question: string;
  imageUrl?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  lessonId?: string;
  stage: StageType;
  gradeNumber: number;
  subjectId: string;
  country?: CountryCode;
  questions: Question[];
  durationMinutes?: number;
  passingScore?: number;
  createdAt: string;
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  userAnswers: number[];
}

export interface LessonAttachment {
  id: string;
  title: string;
  url: string;
  size?: string;
  type?: 'pdf' | 'doc' | 'image' | 'file';
  uploadedAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  stage: StageType;
  gradeNumber: number;
  subjectId: string;
  subjectName: string;
  country?: CountryCode;
  term: 1 | 2 | 3;
  unitTitle?: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  pdfUrl?: string;
  pdfTitle?: string;
  attachments?: LessonAttachment[];
  summaryNotes?: string[];
  keyPoints?: string[];
  quiz?: Quiz;
  viewsCount: number;
  likesCount: number;
  featured?: boolean;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  playlistId?: string;
  playlistTitle?: string;
}

export interface Comment {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isApproved: boolean;
  replyTo?: string;
}

export type UserRole = 'superadmin' | 'moderator' | 'student' | 'teacher' | 'SUPER_ADMIN' | 'COUNTRY_SUPERVISOR' | 'STUDENT';
export type UserStatus = 'active' | 'banned' | 'warned';

export interface UserProfile {
  uid: string;
  id?: string;
  email: string;
  displayName: string;
  name?: string;
  photoURL?: string;
  role: UserRole;
  status?: UserStatus;
  assignedCountry?: CountryCode;
  countryId?: CountryCode;
  country?: CountryCode;
  gradeNumber?: number;
  gradeId?: number | string;
  stage?: StageType;
  savedLessons?: string[];
  quizHistory?: QuizResult[];
  createdAt: string;
  warnMessage?: string;
}

export type LiveClassStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export interface LiveClassAttendee {
  id?: string;
  userId: string;
  name?: string;
  userName: string;
  userRole: UserRole;
  role?: UserRole;
  userCountry?: CountryCode;
  country?: CountryCode;
  joinedAt: string;
  leftAt?: string;
  durationMinutes?: number;
  isHost?: boolean;
}

export interface LiveClass {
  id: string;
  title: string;
  description?: string;
  countryId: CountryCode;
  stage: StageType;
  gradeNumber: number;
  subjectId: string;
  subjectName: string;
  unitTitle?: string;
  lessonId?: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  status: LiveClassStatus;
  roomName: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorCountry: CountryCode;
  attendeesCount?: number;
  attendees?: LiveClassAttendee[];
  createdAt: string;
  updatedAt?: string;
}

export interface LiveKitTokenResponse {
  token: string;
  roomName: string;
  serverUrl: string;
  identity: string;
  name: string;
  role: UserRole;
  canPublish: boolean;
  canSubscribe: boolean;
  canPublishData: boolean;
  isRoomAdmin: boolean;
}

export interface AdSettings {
  headerBanner: boolean;
  sidebarSticky: boolean;
  inArticle: boolean;
  preRollBanner: boolean;
  footerBanner: boolean;
  adClient: string;
}