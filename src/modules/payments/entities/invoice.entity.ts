import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn, OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    invoiceNumber: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @OneToOne(() => Payment, { nullable: true })
    @JoinColumn({ name: 'paymentId' })
    payment: Payment;

    @Column({ nullable: true })
    paymentId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 10, scale: 2 })
    taxRate: number; // e.g., 18 for 18% GST

    @Column('decimal', { precision: 10, scale: 2 })
    taxAmount: number;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ default: 'INR' })
    currency: string;

    @Column({ nullable: true })
    billingAddress: string;

    @Column({ nullable: true })
    gstNumber: string; // User's GST if B2B, otherwise platform GST

    @Column({ default: 'paid' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}
