import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse } from '../Models/auth.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService 
{
  private apiUrl = "https://localhost:7062/api/Users";

  constructor(private http : HttpClient)
  {

  }

  login(logindata : LoginRequest) : Observable<LoginResponse>
  {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`,logindata);
  }
}
