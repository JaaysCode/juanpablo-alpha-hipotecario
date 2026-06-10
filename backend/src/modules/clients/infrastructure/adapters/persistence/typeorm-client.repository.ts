import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { IClientRepository } from '../../../domain/ports/client.repository';
import { Client } from '../../../domain/entities/client';
import { ClientDbEntity } from '../../persistence/entities/client.db.entity';
import { ClientMapper } from '../../persistence/mappers/client.mapper';

@Injectable()
export class TypeOrmClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(ClientDbEntity)
    private readonly repo: Repository<ClientDbEntity>,
  ) {}

  async create(client: Client): Promise<Client> {
    const entity = ClientMapper.toPersistence(client);
    const saved = await this.repo.save(entity);
    return ClientMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Client | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ClientMapper.toDomain(entity) : null;
  }

  async findByNationalIdentification(
    nationalIdentification: string,
  ): Promise<Client | null> {
    const entity = await this.repo.findOne({
      where: { nationalIdentification },
    });
    return entity ? ClientMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? ClientMapper.toDomain(entity) : null;
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ clients: Client[]; total: number }> {
    const where = search
      ? [
          { firstName: ILike(`%${search}%`) },
          { lastName: ILike(`%${search}%`) },
          { nationalIdentification: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
        ]
      : undefined;

    const [entities, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { clients: entities.map(ClientMapper.toDomain), total };
  }

  async update(client: Client): Promise<Client> {
    const entity = ClientMapper.toPersistence(client);
    const saved = await this.repo.save(entity);
    return ClientMapper.toDomain(saved);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
