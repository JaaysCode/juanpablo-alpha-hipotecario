import { ILoanRepository } from '@/modules/loans/domain/ports/loan.repository';

export function createLoanRepositoryMock(): jest.Mocked<ILoanRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByClientId: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
