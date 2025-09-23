import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Injectable } from '@angular/core';
export interface Comment {
  commentId: number;
  createdBy: number;
  commentText: string;
  createdAt: string;
}
export interface CommentResponse
{
  commentId:number;
  message:string;
}
@Injectable({
  providedIn: 'root'
})
export class CommentService {
  comments:Comment[]=[];
  constructor(private http:HttpClient,
    private _cd:ChangeDetectorRef
  ){};
  loadComments(value:number) {
      this.http.get<Comment[]>(`https://localhost:7062/api/Comments/bug/${value}`).subscribe({
        next: res => {
          this.comments = res;
          this._cd.detectChanges();
        },
        error: err => console.error('Error loading comments', err)
      });
    }
getComments():Comment[]
{
  return this.comments;
}
}