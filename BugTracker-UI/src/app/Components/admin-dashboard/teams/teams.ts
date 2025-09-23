import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { TeamService, ITeam, IUser } from  '../../../Services/team';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../../Services/user';
import { ProjectService } from '../../../Services/project';
import { BugService } from '../../../Services/bug.service';


@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './teams.html',
  styleUrls: ['./teams.css']
})
export class Teams implements OnInit {
  teams: ITeam[] = [];
  filteredTeams: ITeam[] = [];
  newTeam: Partial<ITeam> = { teamName: '' };
  newMemberId: number | null = null;
  searchTerm: string = '';
  sortField?: keyof ITeam;
  sortDirection: 'asc' | 'desc' | '' = '';

  selectedTeam$ = new BehaviorSubject<ITeam | null>(null);
  teamMembers$ = new BehaviorSubject<IUser[]>([]);

  allUsers: IUser[] = [];
  eligibleUsers: IUser[] = [];
  unassignedUsers: IUser[] = [];

  // Inline edit
  editTeamId: number | null = null;
  editTeamName: string = '';
  warningModalOpen = false;
  warningMessage = '';
  teamBugStats: {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
  } | null = null;
  // Toast
  showToast = false;
  toastMessage = '';
  private _toastTimeout: any;

  modalOpen = false;
  selectedTeam: ITeam | null = null;

  // --- Pagination ---
  teamsPage = 1;
  teamsPageSize = 5;
  usersPage = 1;
  usersPageSize = 5;

  // constructor(private teamService: TeamService, private chd: ChangeDetectorRef, private userService: UserService) { }
  constructor(
    private teamService: TeamService,
    private projectService: ProjectService,
    private userService: UserService,
    private chd: ChangeDetectorRef,
    private bugService: BugService
  ) { }

  ngOnInit(): void {
    this.getTeams();
    this.teamService.loadTeamsWithCounts();

    this.teamService.teams$.subscribe(teams => {
      this.teams = teams || [];
      if (!this.sortField) {
        this.sortField = 'teamId';
        this.sortDirection = 'asc';
      }
      this.applyFilter();
      this.recalculateEligibleUsers();
      this.recalculateUnassignedUsers();
      this.chd.detectChanges();
    });

    this.teamService.getAllUsers().subscribe({
      next: users => {
        this.allUsers = users;
        this.recalculateEligibleUsers();
        this.recalculateUnassignedUsers();
      },
      error: err => console.error('Failed to load users', err)
    });

  }

  getTeams() {
    this.teamService.getAllTeams().subscribe({
      next: teams => {
        this.teams = teams || [];
        this.filteredTeams = [...this.teams];
      },
      error: err => console.error('Failed to fetch teams', err)
    });
  }

  // Filter + sort
  applyFilter() {
    if (!this.teams || !this.teams.length) {
      this.filteredTeams = [];
      return;
    }

    let result = [...this.teams];

    if (this.searchTerm) {
      result = result.filter(t => t.teamName.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }

    if (this.sortField && this.sortDirection) {
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
    this.teamsPage = 1; // reset page after filter
  }

  sortBy(field: keyof ITeam) {
    if (this.sortField === field) {
      if (this.sortDirection === 'asc') this.sortDirection = 'desc';
      else if (this.sortDirection === 'desc') { this.sortDirection = ''; this.sortField = undefined; }
      else this.sortDirection = 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }

  // Pagination getters
  get paginatedTeams(): ITeam[] {
    const start = (this.teamsPage - 1) * this.teamsPageSize;
    return this.filteredTeams.slice(start, start + this.teamsPageSize);
  }
  get teamsTotalPages(): number {
    return Math.ceil(this.filteredTeams.length / this.teamsPageSize);
  }
  prevTeamsPage() { if (this.teamsPage > 1) this.teamsPage--; }
  nextTeamsPage() { if (this.teamsPage < this.teamsTotalPages) this.teamsPage++; }

  get paginatedUnassigned(): IUser[] {
    const start = (this.usersPage - 1) * this.usersPageSize;
    return this.unassignedUsers.slice(start, start + this.usersPageSize);
  }
  get usersTotalPages(): number {
    return Math.ceil(this.unassignedUsers.length / this.usersPageSize);
  }
  prevUsersPage() { if (this.usersPage > 1) this.usersPage--; }
  nextUsersPage() { if (this.usersPage < this.usersTotalPages) this.usersPage++; }
// Inside Teams class
get maxBugs(): number {
  if (!this.teamBugStats) return 1; // avoid divide by zero
  return Math.max(
    this.teamBugStats.total,
    this.teamBugStats.open,
    this.teamBugStats.inProgress,
    this.teamBugStats.closed,
    1 // ensure at least 1
  );
}

  private recalculateEligibleUsers() {
    const currentTeam = this.selectedTeam;
    if (!this.allUsers || !this.teams) {
      this.eligibleUsers = [];
      return;
    }

    const membershipCount: Record<number, number> = {};
    this.teams.forEach(t => (t.memberIds || []).forEach(id => membershipCount[id] = (membershipCount[id] || 0) + 1));

    this.eligibleUsers = this.allUsers.filter(u => {
      const inCurrentTeam = currentTeam?.memberIds?.includes(u.userId) ?? false;
      const inTwoTeamsOrMore = (membershipCount[u.userId] || 0) >= 1;
      return !inCurrentTeam && !inTwoTeamsOrMore;
    });
  }

  private recalculateUnassignedUsers() {
    const assignedUserIds = new Set<number>();
    this.teams.forEach(t => (t.memberIds || []).forEach(id => assignedUserIds.add(id)));
    this.unassignedUsers = this.allUsers.filter(u => !assignedUserIds.has(u.userId));
  }

  startEditName(team: ITeam) {
    this.editTeamId = team.teamId;
    this.editTeamName = team.teamName;
  }

  saveInlineTeamName(team: ITeam) {
    const updatedName = this.editTeamName.trim();
    if (!updatedName) return;

    const updatedTeam: ITeam = { ...team, teamName: updatedName };

    this.teamService.updateTeam(updatedTeam).subscribe({
      next: () => {
        const index = this.teams.findIndex(t => t.teamId === team.teamId);
        if (index > -1) this.teams[index].teamName = updatedName;
        this.showToastMessage(`Team "${updatedName}" updated successfully`);
        this.editTeamId = null;
        this.applyFilter();
        this.chd.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update team', err);
        this.showToastMessage('Failed to update team');
      }
    });
  }

  cancelInlineEdit() { this.editTeamId = null; }

  showToastMessage(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    this._toastTimeout = setTimeout(() => this.showToast = false, 6000);
  }
  closeToast() {
    this.showToast = false;
    if (this._toastTimeout) clearTimeout(this._toastTimeout);
  }

  addMember() {
    const team = this.selectedTeam;
    if (!team || !this.newMemberId) return;

    this.teamService.addMember(team.teamId, this.newMemberId).subscribe({
      next: () => {
        this.loadMembers(team.teamId);
        this.newMemberId = null;
        this.showToastMessage('Member added successfully');
      },
      error: err => {
        console.error(err);
        this.showToastMessage('Failed to add member');
      }
    });
  }

  removeMember(userId: number) {
    const team = this.selectedTeam;
    if (!team) return;
    this.teamService.removeMember(team.teamId, userId).subscribe(() => this.loadMembers(team.teamId));
  }

  removeAllMembers() {
    const team = this.selectedTeam;
    if (!team) return;
    this.teamService.removeAllMembers(team.teamId).subscribe(() => this.loadMembers(team.teamId));
  }

  openTeamDetails(team: ITeam) {
    this.selectedTeam = team;
    this.modalOpen = true;
    this.loadMembers(team.teamId);
  }

  closeTeamDetails() {
    this.modalOpen = false;
    this.selectedTeam = null;
    this.teamMembers$.next([]);
  }

  private loadMembers(teamId: number) {
    this.teamService.getTeamMemberIds(teamId).subscribe(ids => {
      const team = this.teams.find(t => t.teamId === teamId);
      if (team) { team.memberIds = ids || []; team.membersCount = ids?.length || 0; }
      this.teamMembers$.next(ids?.length ? ids.map(id => this.allUsers.find(u => u.userId === id)!) : []);
      this.recalculateEligibleUsers();
      this.recalculateUnassignedUsers();
      this.applyFilter();
      this.chd.detectChanges();
    });
  }

  deleteTeam(team: ITeam) {
    if (team.membersCount && team.membersCount > 0) {
      this.warningMessage = `Cannot delete "${team.teamName}". Remove all members first.`;
      this.warningModalOpen = true;
      this.chd.detectChanges();
      return;
    }
    if (!confirm(`Are you sure you want to delete "${team.teamName}"?`)) return;

    this.teamService.deleteTeam(team.teamId).subscribe(() => {
      this.showToastMessage(`Team "${team.teamName}" deleted successfully`);
      this.teamService.loadTeamsWithCounts();
    });
  }

  deleteUnassignedUser(userId: number) {
    if (!confirm(`Are you sure you want to delete this user?`)) return;

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.unassignedUsers = this.unassignedUsers.filter(u => u.userId !== userId);
        this.showToastMessage('User deleted successfully');
        this.chd.detectChanges();
      },
      error: err => {
        console.error('Failed to delete user', err);
        this.showToastMessage('Failed to delete user');
      }
    });
  }

  addTeam() {
    if (!this.newTeam.teamName?.trim()) return;

    this.teamService.createTeam(this.newTeam as ITeam).subscribe(() => {
      this.showToastMessage(`Team "${this.newTeam.teamName}" added successfully`);
      this.newTeam = { teamName: '' };
      this.teamService.loadTeamsWithCounts();
    });
  }
  @HostListener('document:keydown', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.modalOpen) {
        this.closeTeamDetails();
      }
      if (this.warningModalOpen) {
        this.warningModalOpen = false;
      }
      if (this.teamInfoModalOpen) {
        this.teamInfoModalOpen = false;
        this.selectedTeam = null;
        this.teamProject = null;
        this.teamInfoMembers = [];
      }
    }
  }

  // Add these two properties to your class
  unassignedSortField?: keyof IUser;
  unassignedSortDirection: 'asc' | 'desc' | '' = '';

  // Sorting function for unassigned users
  sortUnassignedBy(field: keyof IUser) {
    if (this.unassignedSortField === field) {
      if (this.unassignedSortDirection === 'asc') this.unassignedSortDirection = 'desc';
      else if (this.unassignedSortDirection === 'desc') {
        this.unassignedSortDirection = '';
        this.unassignedSortField = undefined;
      }
      else this.unassignedSortDirection = 'asc';
    } else {
      this.unassignedSortField = field;
      this.unassignedSortDirection = 'asc';
    }

    let result = [...this.unassignedUsers];
    if (this.unassignedSortField && this.unassignedSortDirection) {
      result.sort((a, b) => {
        let aVal = a[this.unassignedSortField!] ?? '';
        let bVal = b[this.unassignedSortField!] ?? '';
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return this.unassignedSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.unassignedSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    this.unassignedUsers = result;
    this.usersPage = 1;
  }
  // New states for popup
  teamInfoModalOpen = false;
  teamProject: any = null;
  teamInfoMembers: IUser[] = [];


  // Open popup with project + members
  openTeamDetailsPopup(team: ITeam) {
    this.selectedTeam = team;
    this.teamInfoModalOpen = true;

    // Fetch project
    if (team.projectId) {
      this.projectService.getProjectById(team.projectId).subscribe({
        next: project => {
          this.teamProject = project;
          this.chd.detectChanges();
        },
        error: () => {
          this.teamProject = null;
          this.chd.detectChanges();
        }
      });
    } else {
      this.teamProject = null;
      this.chd.detectChanges();
    }

    // Fetch members
    this.teamService.getTeamMemberIds(team.teamId).subscribe(ids => {
      this.teamInfoMembers = ids?.length
        ? ids.map(id => this.allUsers.find(u => u.userId === id)!).filter(Boolean)
        : [];

      this.chd.detectChanges();

      // 🔹 Fetch bugs created by team members
      this.bugService.getBugs(undefined, undefined, 1, 999, team.teamId).subscribe(bugs => {
        // ✅ filter by projectId in frontend
        const filtered = team.projectId
          ? bugs.filter(b => b.projectId === team.projectId)
          : bugs;

        this.teamBugStats = {
          total: filtered.length,
          open: filtered.filter(b => b.status?.toLowerCase() === 'open').length,
          inProgress: filtered.filter(b => b.status?.toLowerCase() === 'in progress').length,
          closed: filtered.filter(b => b.status?.toLowerCase() === 'closed').length
        };
        console.log(this.teamBugStats);

        this.chd.detectChanges();
      });

    });
  }




  closeTeamInfoPopup() {
    this.teamInfoModalOpen = false;
    this.teamProject = null;
    this.teamInfoMembers = [];
  }


  trackByTeamId(index: number, team: ITeam) { return team.teamId; }
  trackByUserId(index: number, user: IUser) { return user.userId; }
}
