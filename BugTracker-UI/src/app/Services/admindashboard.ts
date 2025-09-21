import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminSummary } from '../Models/admin.dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = 'https://localhost:7062/api/AdminDashboard';

  constructor(private http: HttpClient) 
  {

  }

  getAdminSummary(): Observable<AdminSummary>
  {
    console.log(this.http.get<AdminSummary>(`${this.apiUrl}/summary`));
    return this.http.get<AdminSummary>(`${this.apiUrl}/summary`);
  }
}
