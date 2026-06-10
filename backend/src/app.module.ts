import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './modules/clients/clients.module';
import { LoansModule } from './modules/loans/loans.module';
import { ClientDbEntity } from './modules/clients/infrastructure/persistence/entities/client.db.entity';
import { LoanDbEntity } from './modules/loans/infrastructure/persistence/entities/loan.db.entity';
import { AmortizationEntryDbEntity } from './modules/loans/infrastructure/persistence/entities/amortization-entry.db.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 5432),
        username: cfg.get<string>('DB_USER', 'postgres'),
        password: cfg.get<string>('DB_PASSWORD', 'postgres'),
        database: cfg.get<string>('DB_NAME', 'prueba_tecnica'),
        entities: [ClientDbEntity, LoanDbEntity, AmortizationEntryDbEntity],
        synchronize: true, // dev only — remove in production
      }),
    }),
    ClientsModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
