import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Project } from '../../Models/project.models';
import { AuthService } from '../../Services/auth';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Bug } from '../../Models/bug.model';
import { HttpClient } from '@angular/common/http';
import { BugsListComponent } from '../bug-list-component/bug-list-component';
import { BugForm } from '../bug-form/bug-form';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule,
    BugsListComponent,
    DialogModule
  ],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css']
})
export class UserDashboard implements OnInit {
  projects: Project[] = [];
  showProjectsDropdown = false;
  selectedBugs: Bug[] = [];
  usersMap: Record<number, string> = {};
  projectsMap: Record<number, string> = {};
  loadingBugs = false;

  constructor(
    private http: HttpClient,
    private _authService: AuthService,
    private _cd: ChangeDetectorRef,
    private router: Router,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadUsersMap();
  }

  loadProjects() {
    this.http.get<Project[]>('https://localhost:7062/api/Projects')
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.loadProjectsMap();
        },
        error: (err) => console.error('Error loading projects', err)
      });
  }

  loadUsersMap() {
    this.http.get<any[]>('https://localhost:7062/api/Users')
      .subscribe(users => {
        users.forEach(u => this.usersMap[u.userId] = u.name);
      });
  }

  loadProjectsMap() {
    this.projects.forEach(p => this.projectsMap[p.projectId] = p.projectName);
  }

  onProjectSelect(projectId: number) {
    this.showProjectsDropdown = false;
    this.loadingBugs = true;

    this.http.get<Bug[]>(`https://localhost:7062/api/Bug/project/${projectId}`)
      .subscribe({
        next: (bugs) => {
          this.selectedBugs = bugs;
          this.loadingBugs = false;
          this._cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching bugs', err);
          this.loadingBugs = false;
        }
      });
  }

  // ✅ Open BugForm in Dialog
  openModal() {
    const dialogRef = this.dialog.open(BugForm, {
      width: '600px',
      height: '80vh',       // make it tall for scrolling
      maxHeight: '90vh',    // prevents overflow
      panelClass: 'my-dialog', // custom class for styling
      hasBackdrop: true
    });

    dialogRef.closed.subscribe(result => {
      if (result === 'refresh') {
        console.log('Refresh parent list!');
        // Call your function to reload bugs
      }
    });
  }

  onLogout() {
    localStorage.clear();
    this._authService.logout();
  }
}
