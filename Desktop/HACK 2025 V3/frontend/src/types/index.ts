export type MissionType = 'Remote' | 'Hybrid' | 'Onsite';
export type MissionTerm = 'Short Term' | 'Long Term';

export interface SupportingMedia {
  images: string[];
  video?: string;
}

export interface Job {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  maxPeople: number;
  status: 'open' | 'closed';
  image: string;
  missionType: MissionType;
  missionTerm: MissionTerm;
  date: string;
  dateStart?: string;
  dateEnd?: string;
  details: string;
  skills: string[];
  languages: string[];
  peopleGroups?: string[];
  supportingMedia?: SupportingMedia;
  organizationName: string;
  organizerId?: string;
  applications?: JobApplication[];
}

export interface Organization {
  name: string;
  email: string;
  organizationName: string;
}

export interface JobApplication {
  id: string;
  applicantId: string;
  name: string;
  email: string;
  age?: number | null;
  expertise: string[];
  skills: string[];
  phoneNumber?: string;
  details: string;
  timestamp: number | string; // can be either ISO string or timestamp number
  jobId: string;
}

export interface Application {
  name: string;
  email: string;
  message: string;
}

export type ExpertiseArea = 'Family' | 'Religion' | 'Education' | 'Government' | 'Media' | 'Arts & Entertainment' | 'Business' | 'Healthcare';

export interface Skill {
  id: string;
  name: string;
  category?: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'harvest worker' | 'harvest organizer';
  age?: number;
  expertise: ExpertiseArea[];
  skills: string[];
  phoneNumber?: string;
  attendedMissions: string[]; // Job IDs
  postedMissions: string[]; // Job IDs
}
