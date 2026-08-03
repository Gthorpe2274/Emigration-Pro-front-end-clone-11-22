export interface UserInput {
  destinationCountry: string;
  destinationCity: string;
  profession: string;
  age: string;
  lifestyle: string;
  monthlyBudget: number;
  locationPreference: string;
  climatePreference: string;
  priorities: {
    immigrationPolicies: number;
    healthcare: number;
    safety: number;
    internet: number;
    emigrationProcess: number;
    easeOfImmigration: number;
    localAcceptance: number;
  };
}

export interface Concern {
  id: string;
  title: string;
  description: string;
  prompt: (input: UserInput) => string;
  // Use a simpler type for the Icon to avoid importing React in a type-only file
  Icon: (props: any) => any;
  responseSchema?: Record<string, any>;
}

export interface ReportSectionData {
  id: string;
  title: string;
  content: string;
  sources: { title: string; uri: string }[];
}

export enum AppStep {
  USER_INPUT = 'USER_INPUT',
  CONCERN_SELECTION = 'CONCERN_SELECTION',
  GENERATING_SUMMARY = 'GENERATING_SUMMARY',
  PREVIEW_SUMMARY = 'PREVIEW_SUMMARY',
  GENERATING = 'GENERATING',
  PREVIEW = 'PREVIEW',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  GITHUB_SYNC = 'GITHUB_SYNC'
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  default_branch: string;
}
