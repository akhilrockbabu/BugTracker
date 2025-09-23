import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService, ITeam, IUser } from '../../../Services/team';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './team-details.html',
  styleUrls: ['./team-details.css']
})
export class TeamDetails implements OnInit {
  team: ITeam | null = null;
  members: IUser[] = [];
  roleCount: { [role: string]: number } = {};

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService
  ) {}

 

  ngOnInit() {
  const teamId = Number(this.route.snapshot.paramMap.get('id'));
  if (teamId) {
    this.loadTeamDetails(teamId);
  }
}

loadTeamDetails(teamId: number) {
  this.teamService.getTeamById(teamId).subscribe(team => {
    if (!team) return;
    this.team = team;

    if (team.memberIds && team.memberIds.length) {
      const requests = team.memberIds.map(id => this.teamService.getUserById(id));
      forkJoin(requests).subscribe(users => {
        this.members = users;

        // Count roles
        this.roleCount = {};
        users.forEach(u => {
          if (u.role) this.roleCount[u.role] = (this.roleCount[u.role] || 0) + 1;
        });

        this.team!.membersCount = users.length;
      });
    } else {
      this.team.membersCount = 0;
      this.members = [];
    }
  });
}

}
