export class GetLoansByClientIdQuery {
  constructor(
    public readonly clientId: string,
    public readonly page: number = 1,
    public readonly limit: number = 100,
  ) {}
}
