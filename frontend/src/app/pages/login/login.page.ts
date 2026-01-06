import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@/common/services/auth.service';
import { Router } from '@angular/router';
import { UserRole } from '@/common/interfaces';

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  public username: string = '';
  public password: string = '';
  public isLoading: boolean = false;
  public errorMessage: string = '';

  public onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (user) => {
          if (user.role === UserRole.ADMIN) {
            void this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Permission denied: Admin only';
            this.authService.logout();
          }
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Invalid username or password';
          this.isLoading = false;
        },
      });
  }
}
