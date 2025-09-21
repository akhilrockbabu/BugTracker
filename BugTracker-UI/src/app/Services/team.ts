import { Injectable } from '@angular/core';
import { environment } from './environment';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface IUser {
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
}

export interface ITeam {
  teamId: number;
  teamName: string;
  projectId?: number;
  membersCount?: number;
  memberIds?: number[]; // keep track of actual members
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = environment.apiUrl + 'team';
  private teamSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamSubject.asObservable();

  constructor(private http: HttpClient) {}

  // loads teams + fetches their member counts
  loadTeamsWithCounts(): void {
    this.http.get<ITeam[]>(this.apiUrl).subscribe({
      next: (teams) => {
        if (!teams) {
          this.teamSubject.next([]);
          return;
        }

        const requests = teams.map(t =>
          this.getTeamMemberIds(t.teamId).pipe(
            map(ids => ({ ...t, membersCount: ids.length, memberIds: ids }))
          )
        );

        forkJoin(requests).subscribe(updatedTeams => {
          this.teamSubject.next(updatedTeams);
        });
      },
      error: err => {
        console.error('Failed to load teams', err);
        this.teamSubject.next([]);
      }
    });
  }

  createTeam(team: Partial<ITeam>): Observable<number> {
    return this.http.post<number>(this.apiUrl, team);
  }

  updateTeam(id: number, team: Partial<ITeam>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, team);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTeamMemberIds(teamId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${teamId}/members`);
  }

  getUserById(userId: number): Observable<IUser> {
    return this.http.get<IUser>(`${environment.apiUrl}users/${userId}`);
  }

  addMember(teamId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teamId}/members/${userId}`, {});
  }

  removeMember(teamId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${userId}`);
  }

  removeAllMembers(teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members`);
  }

  getAllUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${environment.apiUrl}users`);
  }
}
