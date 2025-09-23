import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Team } from '../Models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private baseUrl = 'https://localhost:7062/api/team'; // Adjust API endpoint as needed
  private teams: Team[] = [];     // 👈 internal list to store teams

  constructor(private http: HttpClient) {
    this.http.get<Team[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.teams = data;
        console.log('Teams loaded:', this.teams);
      },
      error: (err) => {
        console.error('Error fetching teams:', err);
      }
    });
  }

  // fetch teams from API and store them

  // return stored teams
  getTeams(): Team[] {
    return this.teams;
  }
}
