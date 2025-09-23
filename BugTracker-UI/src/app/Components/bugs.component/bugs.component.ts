import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UpdateBug } from '../update-bug/update-bug';
import { Bug} from '../../Models/bug.model';
import { User } from '../../Models/user.model';
import { Project } from '../bug-form/bug-form';
import { Dialog, DialogModule, DialogRef } from '@angular/cdk/dialog';
export interface Comment {
  commentId: number;
  bugId: number;
  userId: number;
  commentText: string;
  createdAt: string;
}
@Component({
  selector: 'app-bug',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, RouterLink],
  templateUrl: './bugs.component.html',
  styleUrls: ['./bugs.component.css']
})
export class BugComponent implements OnInit {
  bugId!: number;
  bug?: Bug;
  comments: Comment[] = [];
  users: User[] = [];
  projects: Project[] = [];
  newComment = '';
  currentUserId = Number(localStorage.getItem('userId'));
  isCreator = false;
  isAssignee = false;
  baseUrl=`https://localhost:7062/api`;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private _cd: ChangeDetectorRef,
    private dialog:Dialog
  ) {}
 
  ngOnInit(): void {
    this.bugId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBug();
    this.loadComments();
    this.loadUsers();
    this.loadProjects();
  }
 
  loadBug() {
    this.http.get<Bug>(`https://localhost:7062/api/Bug/${this.bugId}`).subscribe({
      next: bug => {
        this.bug = bug;
        this.isCreator = bug.createdBy === this.currentUserId;
        this.isAssignee = bug.assignedTo === this.currentUserId;
        this._cd.detectChanges();
      },
      error: err => console.error('Error loading bug', err)
    });
  }
 
  loadComments() {
    this.http.get<Comment[]>(`https://localhost:7062/api/Bug/comments/${this.bugId}`).subscribe({
      next: res => {
        this.comments = res;
        this._cd.detectChanges();
      },
      error: err => console.error('Error loading comments', err)
    });
  }
 
  loadUsers() {
    this.http.get<User[]>('https://localhost:7062/api/Users').subscribe({
      next: res => (this.users = res),
      error: err => console.error('Error loading users', err)
    });
  }
 
  loadProjects() {
    this.http.get<Project[]>('https://localhost:7062/api/Projects').subscribe({
      next: res => (this.projects = res),
      error: err => console.error('Error loading projects', err)
    });
  }
 
  postComment() {
    if (!this.newComment.trim()) return;
    const body = { bugId: this.bugId, userId: this.currentUserId, commentText: this.newComment };
    this.http.post(`https://localhost:7062/api/Bug/${this.bugId}/comments`, body).subscribe({
      next: () => {
        this.newComment = '';
        this.loadComments();
      },
      error: err => console.error('Error posting comment', err)
    });
  }
 
  updateBugField(field: string, value: any) {
    this.http.patch(`https://localhost:7062/api/Bug/${this.bugId}`, { [field]: value }).subscribe({
      next: () => this.loadBug(),
      error: err => console.error('Error updating bug', err)
    });
  }
 
 
 
   updateStatus(status: string) {
    const actingUserId = Number(localStorage.getItem('userId')); // get from auth/session
    const url = `${this.baseUrl}/Bug/${this.bug?.bugId}/status`;
 
    const params = new HttpParams()
      .set('status', status)
      .set('actingUserId', actingUserId.toString());
 
    this.http.patch(url, {}, { params,responseType:'text' },).subscribe({
      next: () => {
        this.bug!.status= status; // update UI
      },
      error: (err) => console.error('Failed to update status', err)
    });
  }
 
 
  updateAssignee(userId: number) {
  const url = `https://localhost:7062/api/Bug/${this.bugId}/assign/${userId}`;
  this.http
    .patch(url, {}, { responseType: 'text' }) // text if backend returns plain message
    .subscribe({
      next: () => this.loadBug(),
      error: (err) => console.error('Failed to update assignee', err)
    });
}
 
  getUserName(userId: number): string {
    const user = this.users.find(u => u.userId === userId);
    return user ? user.userName : 'Unknown';
  }
 
  // ✅ Open Update Bug Modal
openUpdateBugModal() {
  // Pass the current bug as data to the dialog
  const dialogRef = this.dialog.open(UpdateBug, {
    width: '600px',
    height: '80vh',       // tall for scrolling
    maxHeight: '90vh',    // prevents overflow
    panelClass: 'my-dialog', // optional custom class
    hasBackdrop: true,
    data: { bug: this.bug }   // pass bug data to the form
  });
 
  // Subscribe to dialog close
  dialogRef.closed.subscribe(result => {
    if (result === 'refresh') {
      console.log('Bug updated, refreshing details...');
      this.loadBug(); // reload current bug details
    }
  });
}
 
}
 
 