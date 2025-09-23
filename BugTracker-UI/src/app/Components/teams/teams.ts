import { Component, OnInit } from '@angular/core';
import { TeamService, ITeam, IUser } from '../../Services/team';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css']
})
export class Teams implements OnInit {
  teams: ITeam[] = [];
  newTeam: Partial<ITeam> = { teamName: '' };
  newMemberId: number | null = null;
  searchTerm: string = '';
  sortField?: keyof ITeam;
  sortDirection: 'asc' | 'desc' | '' = '';
  filteredTeams: ITeam[] = [];

  selectedTeam$ = new BehaviorSubject<ITeam | null>(null);
  teamMembers$ = new BehaviorSubject<IUser[]>([]);

  allUsers: IUser[] = [];
  eligibleUsers: IUser[] = [];

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.teamService.teams$.subscribe(res => {
      this.teams = res || [];
      this.applyFilter();
      if (this.teams.length && !this.selectedTeam$.value) this.selectTeam(this.teams[0]);
      this.recalculateEligibleUsers();
    });

    this.teamService.loadTeamsWithCounts();

    this.teamService.getAllUsers().subscribe({
      next: users => { this.allUsers = users; this.recalculateEligibleUsers(); },
      error: err => console.error('Failed to load users', err)
    });
  }

  private recalculateEligibleUsers() {
    const currentTeam = this.selectedTeam$.value;
    const membershipCount: Record<number, number> = {};

    this.teams.forEach(t => (t.memberIds || []).forEach(id => membershipCount[id] = (membershipCount[id] || 0) + 1));

    this.eligibleUsers = this.allUsers.filter(u =>
      (membershipCount[u.userId] || 0) < 2 &&
      (!currentTeam || !(currentTeam.memberIds || []).includes(u.userId))
    );
  }

  selectTeam(team: ITeam) {
    this.selectedTeam$.next(team);
    this.loadMembers(team.teamId);
  }

  applyFilter() {
    let result = [...this.teams];

    if (this.searchTerm) {
      result = result.filter(t => t.teamName.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    if (this.sortDirection && this.sortField) {
      result.sort((a, b) => {
        let aVal = a[this.sortField!] ?? '';
        let bVal = b[this.sortField!] ?? '';
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredTeams = result;
  }

  sortBy(field: keyof ITeam) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
      if (!this.sortDirection) this.sortField = undefined;
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }

  private loadMembers(teamId: number) {
    this.teamService.getTeamMemberIds(teamId).subscribe(ids => {
      if (!ids?.length) { this.teamMembers$.next([]); this.updateTeamMembersAndCounts(teamId, []); return; }

      const requests = ids.map(id => this.teamService.getUserById(id).pipe(
        catchError(() => of({ userId: id, userName: 'Unknown', userEmail: '', role: '' } as IUser))
      ));

      forkJoin(requests).subscribe(users => { 
        this.teamMembers$.next(users); 
        this.updateTeamMembersAndCounts(teamId, ids); 
      });
    });
  }

  private updateTeamMembersAndCounts(teamId: number, memberIds: number[]) {
    const teamIndex = this.teams.findIndex(t => t.teamId === teamId);
    if (teamIndex > -1) {
      this.teams[teamIndex].memberIds = memberIds;
      this.teams[teamIndex].membersCount = memberIds.length;
    }
    this.applyFilter();
    this.recalculateEligibleUsers();
  }

  addTeam() {
    if (!this.newTeam.teamName) return;
    this.teamService.createTeam(this.newTeam).subscribe({ next: () => { this.newTeam = { teamName: '' }; this.teamService.loadTeamsWithCounts(); } });
  }

  updateTeam(team: ITeam) {
    this.teamService.updateTeam(team.teamId, { teamName: team.teamName }).subscribe({ next: () => this.teamService.loadTeamsWithCounts() });
  }

  deleteTeam(teamId: number) {
    this.teamService.deleteTeam(teamId).subscribe({
      next: () => {
        if (this.selectedTeam$.value?.teamId === teamId) { this.selectedTeam$.next(null); this.teamMembers$.next([]); }
        this.teamService.loadTeamsWithCounts();
      }
    });
  }

  addMember() {
    const team = this.selectedTeam$.value;
    if (!team || !this.newMemberId) return;

    this.teamService.addMember(team.teamId, this.newMemberId).subscribe({ next: () => this.loadMembers(team.teamId) });
  }

  removeMember(userId: number) {
    const team = this.selectedTeam$.value;
    if (!team) return;
    this.teamService.removeMember(team.teamId, userId).subscribe({ next: () => this.loadMembers(team.teamId) });
  }

  removeAllMembers() {
    const team = this.selectedTeam$.value;
    if (!team) return;
    this.teamService.removeAllMembers(team.teamId).subscribe({ next: () => this.loadMembers(team.teamId) });
  }

  trackByTeamId(index: number, team: ITeam) { return team.teamId; }
  trackByUserId(index: number, user: IUser) { return user.userId; }
}
