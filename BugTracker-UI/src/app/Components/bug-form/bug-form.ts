import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BugResponse } from '../../Models/bug.model';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

// Models
export interface Label { labelId: number; labelName: string; }
export interface Project { projectId: number; projectName: string; }
export interface Team { teamId: number; teamName: string; }
export interface User { userId: number; userName: string; }

@Component({
  selector: 'app-bug-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bug-form.html',
  styleUrls: ['./bug-form.css']
})
export class BugForm implements OnInit {
  bugForm: FormGroup;

  allUsers$: Observable<User[]> = new Observable();
  allLabels$: Observable<Label[]> = new Observable();
  allTeams$: Observable<Team[]> = new Observable();
  allProjects$: Observable<Project[]> = new Observable();

  selectedLabelIds: number[] = [];

  dataLoaded = false;

  constructor(public dialogRef: DialogRef<BugForm>,
    @Inject(DIALOG_DATA) public data: any,private fb: FormBuilder, private http: HttpClient) {
    this.bugForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['Medium', Validators.required],
      projectId: [null, Validators.required],
      teamId: [null],
      assignedTo: [null]
    });
  }

  ngOnInit(): void {
    // Call APIs and store as Observables
    this.allUsers$ = this.http.get<User[]>('https://localhost:7062/api/users');
    this.allLabels$ = this.http.get<Label[]>('https://localhost:7062/api/labels');
    this.allTeams$ = this.http.get<Team[]>('https://localhost:7062/api/Team');
    this.allProjects$ = this.http.get<Project[]>('https://localhost:7062/api/projects');

    // When all observables emit at least once, mark data loaded (optional)
    this.dataLoaded = true;
  }

  toggleLabel(labelId: number) {
  const idx = this.selectedLabelIds.indexOf(labelId);
  if (idx === -1) {
    this.selectedLabelIds = [...this.selectedLabelIds, labelId];
    console.log('Label added', labelId, this.selectedLabelIds);
  } else {
    this.selectedLabelIds = this.selectedLabelIds.filter(id => id !== labelId);
    console.log('Label removed', labelId, this.selectedLabelIds);
  }
}

  isLabelSelected(labelId: number): boolean {
    return this.selectedLabelIds.includes(labelId);
  }

  assignToMe() {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) { alert('User not logged in'); return; }
    this.bugForm.patchValue({ assignedTo: Number(userIdStr) });
  }

  onSubmit() {
    if (this.bugForm.invalid) { alert('Please fill all required fields.'); return; }

    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) { alert('User not logged in'); return; }
    const userId = Number(userIdStr);

    const formValue = this.bugForm.value;

    const createBugRequest = {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      projectId: formValue.projectId,
      teamId: formValue.teamId ?? null,
      assignedTo: formValue.assignedTo ?? null,
      status:'Open',
      userId: userId,
    };

    // Replace with your actual bug API
    this.http.post<BugResponse>('https://localhost:7062/api/Bug', createBugRequest)
  .subscribe({
    next: (bugResponse) => {
      this.http.post('https://localhost:7062/api/BugLabel/Bulk', { bugId: bugResponse.bugId, labelIds: this.selectedLabelIds })
        .subscribe({
          next: () => alert(`Bug created with Reference ID: ${bugResponse.referenceId}`),
          error: (err) => console.error('Error attaching labels', err)
        });
      this.resetForm();
    },
    error: (err) => console.error('Error creating bug', err)
  });

      this.dialogRef.close();
  
}
resetForm() {
    this.bugForm.reset({ title: '', description: '', priority: 'Medium', projectId: null, teamId: null, assignedTo: null });
    this.selectedLabelIds = [];
  }

  onCancel() {
    this.dialogRef.close();
  }

}
