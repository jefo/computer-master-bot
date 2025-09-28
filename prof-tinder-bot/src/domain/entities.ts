export interface SpecialistProfile {
    name: string;
    description: string;
    tags: string[];
    rate: string; // Using string for now to simplify input
    experience: string;
    portfolioLink: string;
}

// Defines the order for the initial, sequential form filling
export const PROFILE_CREATION_FIELDS: (keyof SpecialistProfile)[] = [
    'name',
    'description',
    'tags',
    'rate',
    'experience',
    'portfolioLink',
];

// Maps field keys to human-readable labels
export const PROFILE_FIELD_LABELS: Record<keyof SpecialistProfile, string> = {
    name: 'Имя',
    description: 'О себе',
    tags: 'Навыки/теги',
    rate: 'Ставка',
    experience: 'Опыт',
    portfolioLink: 'Ссылка на портфолио',
};
