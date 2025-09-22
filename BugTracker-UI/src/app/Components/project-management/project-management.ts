import { Component, OnInit } from '@angular/core';
import { Project, ProjectUserDto } from '../../Models/project.models';
import { ProjectService } from '../../Services/project';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-project-management',
  imports: [ReactiveFormsModule, AsyncPipe],
  template: '',
  styles:[]
})
export class ProjectManagementComponent implements OnInit
{
  projects$! : Observable<Project[]>;
  projectForm! : FormGroup;
  isEditing = false;
  currentProjectId : number | null = null;
  errorMessage = '';

  constructor(private projectService : ProjectService, private fb : FormBuilder)
  {

  }

  ngOnInit() : void
  {
    this.projects$ = this.projectService.projects$;

    this.projectService.getAllprojects().subscribe();

    this.initForm();
  }

  initForm() : void
  {
    this.projectForm = this.fb.group({
      projectKey : ['', [Validators.required, Validators.maxLength(10)]],
      projectName : ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  onSubmit() : void
  {
    if(this.projectForm.invalid)
    {
      return;
    }

    const projectDto : ProjectUserDto = this.projectForm.value;

    if(this.isEditing && this.currentProjectId)
    {
      this.projectService.updateProject(this.currentProjectId, projectDto).subscribe(() => {
        this.resetForm();
      });
    }
    else
    {
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
  }

  deleteProject(projectId: number): void {
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

  resetForm(): void {
    this.isEditing = false;
    this.currentProjectId = null;
    this.errorMessage = '';
    this.projectForm.reset();
  }
}

