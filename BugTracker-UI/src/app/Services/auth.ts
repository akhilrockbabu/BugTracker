import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse } from '../Models/auth.models';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService 
{
  private apiUrl = "https://localhost:7062/api/users";

  constructor(private http : HttpClient, private router : Router)
  {

  }

  login(logindata : LoginRequest) : Observable<LoginResponse>
  {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`,logindata);
  }

    logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    this.router.navigate(['login']);
    }
}
