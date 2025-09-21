import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../Models/team.models';

@Injectable({
  providedIn: 'root'
})
export class TeamService
{
  private apiUrl = "https://localhost:7062/api/Team";


  constructor(private http : HttpClient)
  {

  }

  getAllTeams() : Observable<Team[]>
  {
    return this.http.get<Team[]>(`${this.apiUrl}`);
  }

  getTeamsByProjectId(projectId: number): Observable<Team[]>
  {
    return this.http.get<Team[]>(`${this.apiUrl}/${projectId}/Projects`);
  }

  updateTeam(team : Team) : Observable<void>
  {
    return this.http.put<void>(`${this.apiUrl}/${team.teamId}`,team);
  }
  
}
