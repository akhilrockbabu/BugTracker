import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from './environment';

export interface IUser {
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
}

export interface ITeam {
  teamId: number;
  teamName: string;
  projectId?: number;   // ✅ make sure this exists
  membersCount?: number;
  memberIds?: number[];
}


@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = environment.apiUrl + 'team';
  private teamSubject = new BehaviorSubject<ITeam[]>([]);
  teams$ = this.teamSubject.asObservable();

  constructor(private http: HttpClient) {}
  
  loadTeamsWithCounts(): void {
  this.http.get<ITeam[]>(this.apiUrl).subscribe({
    next: (teams) => {
      if (!teams || !teams.length) {
        this.teamSubject.next([]);
        return;
      }

      const requests = teams.map(t =>
        this.getTeamMemberIds(t.teamId).pipe(
          map(ids => ({
            ...t,
            memberIds: ids || [],
            membersCount: ids?.length || 0
          })),
          catchError(() => of({ ...t, memberIds: [], membersCount: 0 })) // handle error per team
        )
      );

      forkJoin(requests).subscribe({
        next: updatedTeams => this.teamSubject.next(updatedTeams),
        error: err => {
          console.error('Failed to update teams with counts', err);
          this.teamSubject.next(teams.map(t => ({ ...t, memberIds: [], membersCount: 0 })));
        }
      });
    },
    error: err => {
      console.error('Failed to load teams', err);
      this.teamSubject.next([]);
    }
  });
}
  getAllTeams(): Observable<ITeam[]> {
    return this.http.get<ITeam[]>(this.apiUrl);
  }

  getTeamsByProjectId(projectId: number): Observable<ITeam[]> {
    return this.http.get<ITeam[]>(`${this.apiUrl}/${projectId}/Projects`);
  }

  updateTeam(team: ITeam): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${team.teamId}`, team);
  }

  createTeam(team: Partial<ITeam>): Observable<number> {
    return this.http.post<number>(this.apiUrl, team);
  }

  deleteTeam(teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}`);
  }

  getTeamMemberIds(teamId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/${teamId}/members`);
  }
 getTeamById(teamId: number): Observable<ITeam | null> {
    return this.http.get<ITeam>(`${this.apiUrl}/teams/${teamId}`)
      .pipe(
        catchError(err => {
          console.error('Error fetching team', err);
          return of(null);
        })
      );
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
