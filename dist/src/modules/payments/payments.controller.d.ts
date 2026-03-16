import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    recharge(req: any, dto: {
        amount: number;
        gateway: string;
    }): Promise<{
        data: {
            paymentId: string;
            amount: number;
            currency: string;
            status: string;
            mockOrder: string;
        };
    }>;
    verifyMock(req: any, dto: {
        paymentId: string;
    }): Promise<{
        data: import("./entities/payment.entity").Payment;
    }>;
}
