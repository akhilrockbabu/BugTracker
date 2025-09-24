import { Component, OnInit } from '@angular/core';
import { Project, ProjectUpserDto } from '../../../Models/project.models';
import { ProjectService } from '../../../Services/project';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../Services/team';

@Component({
  selector: 'app-project-management',
  imports: [ReactiveFormsModule, AsyncPipe, RouterLink, FormsModule],
  templateUrl: './project-management.html',
  styleUrl: './project-management.css'
})

export class ProjectManagementComponent implements OnInit {
  projects$!: Observable<Project[]>;
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm = ''; // for binding to ngModel
  filteredProjects$!: Observable<Project[]>;
  projectForm!: FormGroup;
  isEditing = false;
  currentProjectId: number | null = null;
  errorMessage = '';

  constructor(private projectService: ProjectService, private fb: FormBuilder, private teamService : TeamService) {

  }
  ngOnInit(): void {
    this.projects$ = this.projectService.projects$;
    this.projectService.getAllprojects().subscribe();
    this.initForm();

    this.filteredProjects$ = combineLatest([
      this.projects$,
      this.searchTermSubject.asObservable().pipe(startWith(''))
    ]).pipe(
      map(([projects, searchTerm]) => {
        if (!searchTerm) return projects;
        const lower = searchTerm.toLowerCase();
        return projects.filter(project =>
          project.projectName.toLowerCase().startsWith(lower)
        );
      })
    );

  }
  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchTermSubject.next(value);
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      projectKey: ['', [Validators.required, Validators.maxLength(10)]],
      projectName: ['', [Validators.required, Validators.maxLength(100)]]

    });

  }
  onSubmit(): void {

    if (this.projectForm.invalid) {
      return;
    }

    const projectDto: ProjectUpserDto = this.projectForm.value;
    if (this.isEditing && this.currentProjectId) {
      this.projectService.updateProject(this.currentProjectId, projectDto).subscribe(() => {
        this.resetForm();
      });
    }
    else {

      this.projectService.createProject(projectDto).subscribe({

        next: () => {

          this.resetForm();

        },

        error: (err) => {

          this.errorMessage = 'Failed to create project. Key or name may already exist.';

          console.error(err);

        }

      });

    }

  }



  editProject(project: Project): void {

    this.isEditing = true;

    this.currentProjectId = project.projectId;

    this.projectForm.setValue({

      projectKey: project.projectKey,

      projectName: project.projectName

    });

    setTimeout(() => {
      document.getElementById('edit-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  }



 deleteProject(projectId: number): void {
 
    this.teamService.getTeamsByProjectId(projectId).subscribe({
      next: (teams) => {
        if (teams && teams.length > 0) {
          alert("UnAssign all the team allocated to this project for this action to be performed");
        }
        else {
          if (confirm('Are you sure you want to delete this project?')) {
 
            this.projectService.deleteProject(projectId).subscribe({
 
              next: () => {
 
              },
 
              error: (err) => {
 
                this.errorMessage = 'Failed to delete project. Make sure no teams are assigned to it.';
 
                console.error(err);
 
              }
 
            });
 
          }
 
        }
      }
      });
  }
 



  resetForm(): void {

    this.isEditing = false;

    this.currentProjectId = null;

    this.errorMessage = '';

    this.projectForm.reset();

  }

  get projectKey() {
    return this.projectForm.get('projectKey');
  }

  get projectName() {
    return this.projectForm.get('projectName');
  }

}