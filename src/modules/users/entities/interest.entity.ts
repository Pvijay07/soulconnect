import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, ManyToMany, JoinTable,
} from 'typeorm';

@Entity('interests')
export class Interest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    category: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    iconUrl: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}
