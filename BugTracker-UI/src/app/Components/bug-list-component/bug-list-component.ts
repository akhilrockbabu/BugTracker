import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Team, User, Project } from '../bug-form/bug-form';
import { Bug } from '../../Models/bug.model';
import { FormsModule } from '@angular/forms';

export interface Bug_UI {
  bugId: number;
  referenceId: string;
  projectId: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  createdBy: number;
  assignedTo: number;
  teamId: number;
  createdByName?: string;
  assignedToName?: string;
  projectName?: string;
}

@Component({
  selector: 'app-bug-list-component',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './bug-list-component.html',
  styleUrls: ['./bug-list-component.css']
})
export class BugsListComponent {
  bugs: Bug_UI[] = [];
  totalBugs = 0;
  page = 1;
  pageSize = 12;
  filter = '';
  userId = 0;
  projectId?: number;
  teamId?: number;
  usersMap: Record<number, string> = {};
  projectsMap: Record<number, string> = {};

  loading = false;
  errorMessage = '';
  teams: Team[] = [];
  Math = Math;

  constructor(
    private http: HttpClient,
    private _cd: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId'));
    // Listen to route param changes
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      if (this.projectId) {
        this.loadInitialData();
      }
    });
  }

  private loadInitialData(): void {
    const users$ = this.http.get<User[]>('https://localhost:7062/api/Users');
    const projects$ = this.http.get<Project[]>('https://localhost:7062/api/Projects');
    const teams$ = this.http.get<Team[]>(`https://localhost:7062/api/Team/user/${this.userId}`);

    forkJoin([users$, projects$, teams$]).subscribe({
      next: ([users, projects, teams]) => {
        users.forEach(u => (this.usersMap[u.userId] = u.userName));
        projects.forEach(p => (this.projectsMap[p.projectId] = p.projectName));

        this.teams = teams;
        if (this.teams.length > 0) {
          this.teamId = this.teams[0].teamId;
        }
        this.loadBugs();
      },
      error: err => {
        console.error('Error loading initial data', err);
        this.errorMessage = 'Failed to load users/projects/teams';
      }
    });
  }

loadBugs(): void {
  if (!this.projectId) return;

  this.loading = true;
  this.errorMessage = '';

  this.http
    .get<Bug[]>(`https://localhost:7062/api/Bug/Project/${this.projectId}`)
    .subscribe({
      next: (rawBugs) => {
        this.totalBugs = rawBugs.length;

        this.bugs = rawBugs.map(b => ({
          ...b,
          createdByName: this.usersMap[b.createdBy] || '—',
          assignedToName: this.usersMap[b.assignedTo] || 'Unassigned',
          projectName: this.projectsMap[b.projectId] || '—'
        }));
        if(this.filter!=="")
          this.bugs=this.bugs.filter(b => b.status===this.filter);
        this.loading = false;
        this._cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading bugs', err);
        this.errorMessage = 'Failed to load bugs. Please try again later.';
        this.loading = false;
      }
    });
}


  onFilterChange(value: string): void {
    this.filter = value;
    this.page = 1;
    this.loadBugs();
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadBugs();
    this._cd.detectChanges();
  }

  trackByBugId(index: number, bug: Bug_UI) {
    return bug.bugId;
  }

  downloadCSV(): void {
    if (this.bugs.length === 0) return;

    const headers = Object.keys(this.bugs[0]);
    const csvRows: string[] = [];

    csvRows.push(headers.join(','));
    for (const bug of this.bugs) {
      const values = headers.map(header => {
        let val = (bug as any)[header];
        if (val == null) val = '';
        else if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
        return val;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${this.projectId}-bugs-page${this.page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get totalPages(): number {
    return this.Math.ceil(this.totalBugs / this.pageSize);
  }
}
