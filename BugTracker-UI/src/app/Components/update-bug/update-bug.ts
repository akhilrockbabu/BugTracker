import { CommonModule } from '@angular/common';
import { Component, Inject, NgZone, OnInit } from '@angular/core'; // Added Inject
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../Models/user.model';
import { Bug, BugResponse } from '../../Models/bug.model';
import { Label, Team, Project } from '../bug-form/bug-form';
import { ActivatedRoute } from '@angular/router';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog'; // Added MAT_DIALOG_DATA

@Component({
  selector: 'app-update-bug',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-bug.html',
  styleUrls: ['./update-bug.css'],
})
export class UpdateBug implements OnInit {
  // @Input() is no longer needed
  bugId!: number;

  bugForm: FormGroup;

  allUsers$: Observable<User[]> = new Observable();
  allLabels$: Observable<Label[]> = new Observable();
  allTeams$: Observable<Team[]> = new Observable();
  allProjects$: Observable<Project[]> = new Observable();

  selectedLabelIds: number[] = [];

  dataLoaded = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private zone: NgZone,
    public dialogRef: DialogRef<UpdateBug>,
    @Inject(DIALOG_DATA) public data: { bugId: number } // Inject the dialog data
  ) {
    this.bugForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['Medium', Validators.required],
      projectId: [{ value: null, disabled: true }, Validators.required],
      teamId: [null],
      assignedTo: [null],
    });
  }

  ngOnInit(): void {
    // Get bugId from the injected data
    this.bugId = this.data.bugId;
    
    this.allUsers$ = this.http.get<User[]>('https://localhost:7062/api/users');
    this.allLabels$ = this.http.get<Label[]>('https://localhost:7062/api/labels');
    this.allTeams$ = this.http.get<Team[]>('https://localhost:7062/api/Team');
    this.allProjects$ = this.http.get<Project[]>('https://localhost:7062/api/projects');
    
    this.loadBugData(this.bugId);
  }

  loadBugData(bugId: number) {
    this.http
      .get<Bug>(`https://localhost:7062/api/Bug/${bugId}`)
      .subscribe({
        next: (bug) => {
          this.bugForm.patchValue({
            title: bug.title,
            description: bug.description,
            priority: bug.priority,
            projectId: bug.projectId,
            teamId: bug.teamId,
            assignedTo: bug.assignedTo !== 0 ? bug.assignedTo : null,
          });
          this.loadSelectedLabels(bugId);
          this.dataLoaded = true;
        },
        error: (err) => {
          console.error('Error loading bug data', err);
          this.dataLoaded = true;
        },
      });
  }

  loadSelectedLabels(bugId: number) {
    this.http
      .get<{ bugId: number; labelId: number }[]>(
        `https://localhost:7062/api/BugLabel/${bugId}`
      )
      .subscribe({
        next: (labels) => {
          this.selectedLabelIds = labels.map((l) => l.labelId);
        },
        error: (err) => {
          console.error('Error loading labels for bug', err);
          this.selectedLabelIds = [];
        },
      });
  }

  toggleLabel(labelId: number) {
    this.zone.run(() => {
      const idx = this.selectedLabelIds.indexOf(labelId);
      if (idx === -1) this.selectedLabelIds.push(labelId);
      else this.selectedLabelIds.splice(idx, 1);
    });
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
    this.bugForm.patchValue({ assignedTo: Number(userIdStr) });
  }

  onSubmit() {
    if (this.bugForm.invalid) {
      alert('Please fill all required fields.');
      return;
    }

    const formValue = this.bugForm.getRawValue();

    const updateBugRequest = {
      bugId: this.bugId,
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      teamId: formValue.teamId ?? null,
      assignedTo: formValue.assignedTo ?? null,
    };

    this.http
      .put(`https://localhost:7062/api/Bug/${this.bugId}`, updateBugRequest)
      .subscribe({
        next: () => {
          this.http
            .put('https://localhost:7062/api/BugLabel/UpdateBulk', {
              bugId: this.bugId,
              labelIds: this.selectedLabelIds,
            })
            .subscribe({
              next: (res) => {
                alert('Bug updated successfully');
                this.dialogRef.close();
              },
              error: (err) => {
                console.error('Error updating labels', err);
                alert('Failed to update bug labels.');
              },
            });
        },
        error: (err) => {
          console.error('Error updating bug', err);
          alert('Failed to update bug.');
        },
      });
  }

  resetForm() {
    this.bugForm.reset();
    this.selectedLabelIds = [];
    this.loadBugData(this.bugId);
  }

  onCancel() {
    this.dialogRef.close();
  }
}