import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateClientUseCase } from '../../application/commands/create-client.use-case';
import { EmploymentType } from '../../domain/client.model';
import { slideDown } from '../../../../shared/animations';

@Component({
  selector: 'app-client-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './client-create.html',
  styleUrl: './client-create.css',
  animations: [slideDown],
})
export class ClientCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly createClient = inject(CreateClientUseCase);
  private readonly router = inject(Router);

  readonly employmentTypes = Object.values(EmploymentType);
  loading = signal(false);
  serverError = signal<string | null>(null);
  success = signal(false);

  form = this.fb.group({
    nationalIdentification: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
    monthlyIncome: [null as number | null, [Validators.required, Validators.min(0)]],
    monthlyExpenses: [null as number | null, [Validators.min(0)]],
    numberOfDependents: [null as number | null, [Validators.min(0)]],
    currentAddress: ['', [Validators.maxLength(255)]],
    employmentType: ['' as EmploymentType, [Validators.required]],
    company: ['', [Validators.maxLength(255)]],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c || !c.errors) return '';
    if (c.errors['required']) return 'Campo requerido.';
    if (c.errors['email']) return 'Email inválido.';
    if (c.errors['min']) return `Mínimo ${c.errors['min'].min}.`;
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres.`;
    return 'Valor inválido.';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.serverError.set(null);

    const v = this.form.value;
    const payload: Record<string, unknown> = {
      nationalIdentification: v.nationalIdentification,
      firstName: v.firstName,
      lastName: v.lastName,
      dateOfBirth: v.dateOfBirth,
      email: v.email,
      phoneNumber: v.phoneNumber,
      monthlyIncome: Number(v.monthlyIncome),
      employmentType: v.employmentType,
    };
    if (v.monthlyExpenses != null) payload['monthlyExpenses'] = Number(v.monthlyExpenses);
    if (v.numberOfDependents != null) payload['numberOfDependents'] = Number(v.numberOfDependents);
    if (v.currentAddress) payload['currentAddress'] = v.currentAddress;
    if (v.company) payload['company'] = v.company;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.createClient.execute(payload as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/clients']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message;
        this.serverError.set(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al crear el cliente.'));
      },
    });
  }
}
