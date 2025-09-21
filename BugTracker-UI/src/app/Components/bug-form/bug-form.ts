import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

// Replace these imports with your actual services
import { ProjectService } from '../../Services/project';
import { UserService } from '../../Services/user.service';
import { LabelService } from '../../Services/label.service';
import { TeamService } from '../../Services/team.service';
import { BugService } from '../../Services/bug.service';
import { User } from '../../Models/user.model';
import { Team } from '../../Models/team.model';

export interface Label {
  labelId: number;
  labelName: string;
}

export interface Project {
  projectId: number;
  projectKey: string;
  projectName: string;
}


@Component({
  selector: 'app-bug-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bug-form.html',
  styleUrls: ['./bug-form.css'],
})
export class BugForm implements OnInit {
  bugForm: FormGroup;



  allProjects: Project[] = [];
  allTeams: Team[] = [];
  allUsers: User[] = [];
  allLabels:Label[]=[];

  selectedLabelIds: number[] = [];

  private projectsSub?: Subscription;
  private teamsSub?: Subscription;
  private usersSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private bugService: BugService,
    private projectService: ProjectService,
    private userService: UserService,
    private labelService: LabelService,
    private teamService: TeamService
  ) {
    this.bugForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['Medium', Validators.required],
      projectId: [null, Validators.required],
      teamId: [null],
      assignedTo: [null],
    });
  }
dataLoaded=false;
  ngOnInit(): void {
  this.userService.loadUsers();
  this.labelService.LoadLables();
  this.teamService.loadTeams();
  this.projectService.loadProjects();

    this.allUsers = this.userService.getAllUsers();
    this.allLabels = this.labelService.getAllLabels();

    this.allProjects = this.projectService.getProjects();
    

    this.allTeams = this.teamService.getTeams();
    this.dataLoaded=true;
    console.log(this.allTeams)
    
  }
  // You can now completely remove the filterProjects, filterTeams, and filterUsers methods.

  toggleLabel(labelId: number) {
    const idx = this.selectedLabelIds.indexOf(labelId);
    if (idx === -1) {
      this.selectedLabelIds.push(labelId);
    } else {
      this.selectedLabelIds.splice(idx, 1);
    }
  }

  isLabelSelected(labelId: number): boolean {
    return this.selectedLabelIds.includes(labelId);
  }

  assignToMe() {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      alert('User not logged in');
      return;
    }
    const userId = Number(userIdStr);
    this.bugForm.patchValue({ assignedTo: userId });
  }

  onSubmit() {
    if (this.bugForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }

    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      alert('User not logged in');
      return;
    }
    const userId = Number(userIdStr);

    // Prepare the create bug request matching the interface
    const formValue = this.bugForm.value;

    const createBugRequest = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      projectId: formValue.projectId,
      teamId: formValue.teamId ?? null,
      assignedTo: formValue.assignedTo ?? null,
      UserId: userId,
      labelIds: this.selectedLabelIds,
    };
  console.log(this.allProjects);
    this.bugService.createBug(createBugRequest).subscribe({
      next: (createdBug: { id: number }) => {
        alert('Bug created successfully.');
        this.resetForm();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error creating bug.');
      },
    });
  }

  resetForm() {
    this.bugForm.reset({
      title: '',
      description: '',
      priority: 'Medium',
      projectId: null,
      teamId: null,
      assignedTo: null,
    });
    this.selectedLabelIds = [];
  }


}