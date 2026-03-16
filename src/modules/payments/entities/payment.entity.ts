import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 20 })
    gateway: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    gatewayTxnId: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 3, default: 'INR' })
    currency: string;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;
}
