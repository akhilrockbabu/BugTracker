import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateBugRequest } from '../Models/bug.model';

export interface Bug {
  bugId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: number | null;
  teamId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class BugService {
  private baseUrl = 'https://localhost:7062/api/bugs'; // adjust to your backend

  constructor(private http: HttpClient) {}

  getBugs(
    status?: string,
    assignedTo?: number,
    page: number = 1,
    pageSize: number = 10,
    teamId?: number
  ): Observable<Bug[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (status) params = params.set('status', status);
    if (assignedTo) params = params.set('assignedTo', assignedTo);
    if (teamId) params = params.set('TeamId', teamId);

    return this.http.get<Bug[]>(this.baseUrl, { params });
  }
  createBug(bug: CreateBugRequest): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(this.baseUrl, bug);
}
}
