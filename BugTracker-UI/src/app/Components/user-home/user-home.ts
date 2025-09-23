import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Team } from '../../Models/team.models';
import { User } from '../../Models/user.model';
import { Project } from '../../Models/project.models';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

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
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-home.html',
  styleUrls: ['./user-home.css']
})
export class UserHome implements OnInit, AfterViewInit {
  bugs: Bug_UI[] = [];
  totalBugs = 0;
  page = 1;
  pageSize = 12;
  filter = '';
  userId = 0;
  teamId?: number;
  usersMap: Record<number, string> = {};
  projectsMap: Record<number, string> = {};

  loading = false;
  errorMessage = '';
  teams: Team[] = [];
  Math = Math;

  // Chart reference
  @ViewChild('bugSummaryChart') bugSummaryChartRef!: ElementRef;
  bugChart!: Chart;

  bugSummary = {
    totalBugs: 0,
    openBugs: 0,
    inProgressBugs: 0,
    closedBugs: 0,
    assignedBugs: 0
  };

  constructor(private http: HttpClient, private _cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('userId'));

    const users$ = this.http.get<User[]>('https://localhost:7062/api/Users');
    const projects$ = this.http.get<Project[]>('https://localhost:7062/api/Projects');
    const teams$ = this.http.get<Team[]>(`https://localhost:7062/api/Team/user/${this.userId}`);

    forkJoin([users$, projects$, teams$]).subscribe({
      next: ([users, projects, teams]) => {
        users.forEach(u => this.usersMap[u.userId] = u.userName);
        projects.forEach(p => this.projectsMap[p.projectId] = p.projectName);

        this.teams = teams;
        if (this.teams.length > 0) {
          this.teamId = this.teams[0].teamId;
          this.loadBugs();
          this.loadBugSummary();
        }
      },
      error: err => {
        console.error('Error loading initial data', err);
        this.errorMessage = 'Failed to load users/projects/teams';
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize chart after view is loaded
    if (this.teamId) {
      this.createBugSummaryChart();
    }
  }

  loadBugs(): void {
    if (!this.teamId) return;

    this.loading = true;
    this.errorMessage = '';

    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('pageSize', this.pageSize.toString())
      .set('TeamId', this.teamId.toString());

    if (this.filter.trim()) {
      params = params.set('status', this.filter.trim());
    }

    this.http.get<Bug_UI[]>('https://localhost:7062/api/Bug', { params, observe: 'response' }).subscribe({
      next: resp => {
        const rawBugs = resp.body ?? [];
        this.totalBugs = Number(resp.headers.get('X-Total-Count')) || rawBugs.length;

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
      error: err => {
        console.error('Error loading bugs', err);
        this.errorMessage = 'Failed to load bugs. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadBugSummary(): void {
    if (!this.teamId) return;

    this.http.get<any>(`https://localhost:7062/api/Bug/summary?TeamId=${this.teamId}`)
      .subscribe({
        next: data => {
          this.bugSummary = data;
          this.updateChart();
          this._cd.detectChanges();
        },
        error: err => console.error('Error fetching bug summary', err)
      });
  }

  createBugSummaryChart(): void {
    if (!this.bugSummaryChartRef) return;

    this.bugChart = new Chart(this.bugSummaryChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: ['Open', 'In Progress', 'Closed'],
        datasets: [{
          data: [
            this.bugSummary.openBugs,
            this.bugSummary.inProgressBugs,
            this.bugSummary.closedBugs,
          ],
          backgroundColor: ['#f43f5e', '#fbbf24', '#10b981']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Team Bug Summary'
          }
        }
      }
    });
    this._cd.detectChanges();
  }

  updateChart(): void {
    if (this.bugChart) {
      this.bugChart.data.datasets[0].data = [
        this.bugSummary.openBugs,
        this.bugSummary.inProgressBugs,
        this.bugSummary.closedBugs,
      ];
      this.bugChart.update();
      this._cd.detectChanges();
    } else {
      this.createBugSummaryChart();
            this._cd.detectChanges();

    }
  }

  onFilterChange(value: string): void {
    this.filter = value;
    this.page = 1;
    this.loadBugs();
    this._cd.detectChanges();
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.page = newPage;
    this.loadBugs();
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
    a.download = `team-${this.teamId}-bugs-page${this.page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get totalPages(): number {
    return this.Math.ceil(this.totalBugs / this.pageSize);
  }
}
