import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('banners')
export class Banner {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 200 })
    title: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    subtitle: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    imageUrl: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    actionUrl: string;

    @Column({ type: 'varchar', length: 50, default: 'promo' })
    type: string; // 'promo', 'offer', 'announcement'

    @Column({ type: 'varchar', length: 100, nullable: true })
    gradientStart: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    gradientEnd: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @Column({ type: 'timestamptz', nullable: true })
    startsAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    expiresAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
