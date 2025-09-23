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
// Removed the import for CommentService

export interface Comment {
  commentId: number;
  createdBy: number;
  commentText: string;
  createdAt: string;
}

export interface CommentResponse {
  commentId: number;
  message: string;
}

@Component({
  selector: 'app-bug',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, RouterLink],
  templateUrl: './bug.html',
  styleUrls: ['./bug.css']
})
export class BugComponent implements OnInit {
  bugId!: number;
  bug?: Bug;
  comments: Comment[] = [];
  commentResponse: CommentResponse = {
    commentId: 0,
    message: ''
  };
  users: User[] = [];
  projects: Project[] = [];
  newComment = '';
  currentUserId = Number(localStorage.getItem('userId'));
  isCreator = false;
  isAssignee = false;
  baseUrl = `https://localhost:7062/api`;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private _cd: ChangeDetectorRef,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.bugId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadBug();
    this.loadComments(this.bugId); // Call loadComments directly
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

  // New method to load comments directly in the component
  loadComments(bugId: number) {
    // Corrected API endpoint with '/bug/' segment
    this.http.get<Comment[]>(`${this.baseUrl}/Comments/bug/${bugId}`).subscribe({
      next: res => {
        this.comments = res;
        this._cd.detectChanges(); // Ensure the view is updated
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
    const body = { 
      bugId: this.bugId, 
      userId: this.currentUserId, 
      commentText: this.newComment 
    };
    this.http.post(`${this.baseUrl}/Comments`, body).subscribe({
      next: () => {
        this.newComment = '';
        this.loadComments(this.bugId); // Reload comments after a successful post
      },
      error: err => console.error('Error posting comment', err)
    });
  }

  updateBugField(field: string, value: any) {
    this.http.patch(`${this.baseUrl}/Bug/${this.bugId}`, { [field]: value }).subscribe({
      next: () => this.loadBug(),
      error: err => console.error('Error updating bug', err)
    });
  }

  updateStatus(status: string) {
    const actingUserId = Number(localStorage.getItem('userId'));
    const url = `${this.baseUrl}/Bug/${this.bug?.bugId}/status`;

    const params = new HttpParams()
      .set('status', status)
      .set('actingUserId', actingUserId.toString());

    this.http.patch(url, {}, { params, responseType: 'text' }).subscribe({
      next: () => {
        this.bug!.status = status;
      },
      error: (err) => console.error('Failed to update status', err)
    });
  }

  updateAssignee(userId: number) {
    const url = `https://localhost:7062/api/Bug/${this.bugId}/assign/${userId}`;
    this.http
      .patch(url, {}, { responseType: 'text' })
      .subscribe({
        next: () => this.loadBug(),
        error: (err) => console.error('Failed to update assignee', err)
      });
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.userId === userId);
    return user ? user.userName : 'Unknown';
  }

  openUpdateBugModal() {
    const dialogRef = this.dialog.open(UpdateBug, {
      width: '600px',
      height: '80vh',
      maxHeight: '90vh',
      panelClass: 'my-dialog',
      hasBackdrop: true,
      data: { bugId: this.bug!.bugId }
    });

    dialogRef.closed.subscribe(result => {
      if (result) {
        console.log('Bug updated, refreshing details...');
        this.loadBug();
      }
    });
  }
}