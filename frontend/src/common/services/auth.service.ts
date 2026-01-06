import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, UserRole } from '@/common/interfaces';
import { environment } from '@/environments/environment';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getInitialUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private getInitialUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        try {
          return JSON.parse(savedUser) as User;
        } catch (e) {
          console.error('Error in finding user in localStorage', e);
          localStorage.removeItem('user');
          return null;
        }
      }
    }
    return null;
  }

  public login(credentials: { username: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, credentials).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
    );
  }

  public logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    void this.router.navigate(['/login']);
  }

  public isAdmin(): boolean {
    return this.currentUserSubject.value?.role === UserRole.ADMIN;
  }

  public isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
