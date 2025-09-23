import { CommonModule, NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService, IUser } from '../../../Services/user';
import { ChangeDetectorRef } from '@angular/core';
import { TeamService } from '../../../Services/team';
import { Bug, BugService } from '../../../Services/bug.service';


@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule,NgFor, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Users implements OnInit {
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  uniqueTeams: string[] = [];

  SelectedRole: string = '';
  SelectedTeam: string = '';
  searchTerm: string = '';

  showAddModal = false;
  editingUser: IUser | null = null;
  allBugs: Bug[] = [];
  userStatus:{[userId:number]:{teamNames:string[],totalBugs:number,open:number,inProgress:number,closed:number}}={}
  newUser: Partial<IUser> = {
    userName: '',
    userEmail: '',
    role: '',
    password: '',
    teamName: []
  };

  sortField: string = 'userId';
  sortDirection: 'asc' | 'desc' | '' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  teamSearchTerm: string = '';
  filteredTeams: string[] = [];
  constructor(private cdr: ChangeDetectorRef, private userService: UserService, private teamService: TeamService, private bugService: BugService) { }

  ngOnInit() {
    // Fetch all teams first
    this.teamService.getAllTeams().subscribe((teams: any) => {
      console.log('Teams API Response (from TeamService):', teams);
      this.uniqueTeams = teams.map((t: any) => t.teamName);
      this.cdr.detectChanges();
    });


    // Subscribe to users
    this.userService.users$.subscribe(users => {
      // Ensure teamName is always an array
      this.users = users.map(u => ({ ...u, teamName: u.teamName || [] }));
      this.applyFilter();
      this.cdr.detectChanges();
    });

    this.userService.getUsers();
     // fetch teams
    this.teamService.getAllTeams().subscribe((teams: any) => {
      this.uniqueTeams = teams.map((t: any) => t.teamName);
      this.cdr.detectChanges();
    });

    // fetch users
    this.userService.users$.subscribe(users => {
      this.users = users.map(u => ({ ...u, teamName: u.teamName || [] }));
      this.applyFilter();
      this.computeUserStats();
      this.cdr.detectChanges();
    });
    this.userService.getUsers();

    // fetch bugs
    this.bugService.getBugs(undefined, undefined, 1, 999).subscribe(bugs => {
      this.allBugs = bugs;
      this.computeUserStats();
      this.cdr.detectChanges();
    });
  }
get maxBugs(): number {
  let max = 1;
  for (let key in this.userStatus) {
    const stats = this.userStatus[key];
    max = Math.max(max, stats.totalBugs, stats.open, stats.inProgress, stats.closed);
  }
  return max;
}
ngAfterViewInit() {
  setTimeout(() => {
    this.cdr.detectChanges(); // triggers the transition
  }, 50);
}

  // ---------------- Filtering ----------------
  applyFilter() {
    this.filteredUsers = this.users.filter(u => {
      const roleMatch = this.SelectedRole ? u.role === this.SelectedRole : true;
      const teamMatch = this.SelectedTeam ? u.teamName.includes(this.SelectedTeam) : true;
      const searchMatch =
        u.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.cdr.detectChanges();
      u.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase());
      return roleMatch && teamMatch && searchMatch;
    });
    this.applySort();
    this.setPagination();
  }

  // ---------------- Sorting ----------------
  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySort();
    this.setPagination();
  }

  applySort() {
    if (!this.sortField || this.sortDirection === '') return;
    this.filteredUsers = [...this.filteredUsers].sort((a: any, b: any) => {
      const valA = a[this.sortField] ?? '';
      const valB = b[this.sortField] ?? '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortArrow(field: string): string {
    if (this.sortField !== field || this.sortDirection === '') return '⇅';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // ---------------- Add/Edit/Delete ----------------
  openAddModal() {
    this.showAddModal = true;
    this.newUser = { userName: '', userEmail: '', role: '', password: '', teamName: [] };
  }

  closeAddModal() {
    this.showAddModal = false;
    this.newUser = { userName: '', userEmail: '', role: '', password: '', teamName: [] };
    this.cdr.detectChanges();
  }

  openEditModal(user: IUser) {
    this.editingUser = {
      ...user,
      teamName: [...user.teamName] // copy array
    };
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.editingUser = null;
  }

  addUser() {
    if (!this.newUser.userName || !this.newUser.userEmail || !this.newUser.role) return;
    this.newUser.password = this.newUser.userEmail; // default password
    this.userService.createUser(this.newUser as IUser).subscribe(() => {
      this.closeAddModal();
      this.applyFilter();
      this.cdr.detectChanges();
    });
  }

  saveEdit() {
    if (!this.editingUser) return;
    this.userService.updateUser(this.editingUser.userId, this.editingUser).subscribe(() => {
      this.closeEditModal();
      this.applyFilter();
      this.cdr.detectChanges();
    });
  }

  deleteUser(userId: number) {
    this.userService.deleteUser(userId).subscribe(() => {
      this.applyFilter();
      this.cdr.detectChanges();
    });
  }

  // ---------------- Keyboard (Esc) ----------------
  @HostListener('document:keydown.escape')
  onEscKey() {
    if (this.editingUser) this.closeEditModal();
    if (this.showAddModal) this.closeAddModal();
  }

  // ---------------- Pagination ----------------
  setPagination() {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages || 1;
  }

  get pagedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

 computeUserStats() {
  if (!this.users.length || !this.allBugs.length) return;

  this.userStatus = {};

  this.users.forEach(user => {
    const userTeamIds = user.teamIds || []; // use numeric IDs
    const userBugs = this.allBugs.filter(b =>
      b.createdBy === user.userId &&
      (userTeamIds.length === 0 || userTeamIds.includes(b.teamId))
    );

    this.userStatus[user.userId] = {
      teamNames: user.teamName,
      totalBugs: userBugs.length,
      open: userBugs.filter(b => b.status?.toLowerCase() === "open").length,
      inProgress: userBugs.filter(b => b.status?.toLowerCase() === "in progress").length,
      closed: userBugs.filter(b => b.status?.toLowerCase() === "closed").length
    };
  });

  this.cdr.detectChanges();
}


}
