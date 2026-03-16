import { User } from './user.entity';
export declare class Profile {
    id: string;
    userId: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    gender: string;
    dateOfBirth: Date;
    languages: string[];
    preferredLanguage: string;
    country: string;
    timezone: string;
    isOnline: boolean;
    lastSeenAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
