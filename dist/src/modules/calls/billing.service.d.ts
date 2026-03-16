import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Call } from './entities/call.entity';
import { WalletService } from '../wallet/wallet.service';
import { CallsGateway } from './gateways/calls.gateway';
import { CallsService } from './calls.service';
export declare class CallBillingService implements OnModuleInit, OnModuleDestroy {
    private readonly callRepo;
    private readonly walletService;
    private readonly callsGateway;
    private readonly callsService;
    private readonly logger;
    private interval;
    constructor(callRepo: Repository<Call>, walletService: WalletService, callsGateway: CallsGateway, callsService: CallsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private processBilling;
}
