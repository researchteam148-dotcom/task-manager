export const DEPARTMENTS = [
    'Computer Science',
    'Data Science',
    'Information Technology',
    'AIML',
    'Civil',
    'Mechanical',
    'EEE',
    'ECE',
] as const;

export type Department = typeof DEPARTMENTS[number];
