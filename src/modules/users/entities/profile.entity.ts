import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    displayName: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatarUrl: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    gender: string;

    @Column({ type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ type: 'simple-array', default: 'en' })
    languages: string[];

    @Column({ type: 'varchar', length: 10, default: 'en' })
    preferredLanguage: string;

    @Column({ type: 'varchar', length: 3, nullable: true })
    country: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    timezone: string;

    @Column({ type: 'boolean', default: false })
    isOnline: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    lastSeenAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
