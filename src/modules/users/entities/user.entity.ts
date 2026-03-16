import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, OneToOne, OneToMany,
} from 'typeorm';

// Using names instead of classes to break circularity in relations

export enum UserRole {
    USER = 'user',
    LISTENER = 'listener',
    ADMIN = 'admin',
}

export enum UserStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    BANNED = 'banned',
    DELETED = 'deleted',
}

export enum AuthProvider {
    EMAIL = 'email',
    PHONE = 'phone',
    GOOGLE = 'google',
    APPLE = 'apple',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true, select: false })
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.EMAIL })
    authProvider: AuthProvider;

    @Column({ type: 'varchar', length: 255, nullable: true })
    providerId: string;

    @Column({ type: 'boolean', default: false })
    isAnonymous: boolean;

    @Column({ type: 'boolean', default: false })
    emailVerified: boolean;

    @Column({ type: 'boolean', default: false })
    phoneVerified: boolean;

    @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
    referralCode: string;

    @Column({ type: 'int', default: 0 })
    callCount: number;

    @Column({ type: 'timestamptz', nullable: true })
    lastLoginAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    // Relations
    @OneToOne('Profile', 'user', { cascade: true })
    profile: any;

    @OneToOne('ListenerProfile', 'user', { cascade: true })
    listenerProfile: any;

    @OneToOne('Wallet', 'user', { cascade: true })
    wallet: any;
}
