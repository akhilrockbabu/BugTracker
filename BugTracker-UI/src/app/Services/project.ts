import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Project, ProjectUserDto } from '../Models/project.models';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ProjectService
{
  private apiUrl = "https://localhost:7062/api/Projects";
  private projectsSource = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSource.asObservable();
  myProjects:Project[]=[];
  constructor(private http : HttpClient)
  {

  }

  getAllprojects() : Observable<Project[]>
  {
    return this.http.get<Project[]>(this.apiUrl).pipe(
      tap(projects => {
        this.projectsSource.next(projects);
      })
    );
  }

  createProject(project : ProjectUserDto) : Observable<Project>
  {
    const newProject = {projectId:0,...project};
    return this.http.post<Project>(this.apiUrl, newProject).pipe(
      tap(() => {
        this.getAllprojects().subscribe();
      })
    );
  }

  
  updateProject(id : number, project:ProjectUserDto) : Observable<void>
  {
    const updatedProject = {projectId : id, ...project};
    return this.http.put<void>(`${this.apiUrl}/${id}`, updatedProject).pipe(
      tap(() => {
        this.getAllprojects().subscribe();
      })
    );
  }

  deleteProject(id : number) : Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.getAllprojects().subscribe();
      })
    );
  }
  loadProjects(): void {
    this.http.get<Project[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.myProjects = data;
        console.log('Projects loaded:', this.myProjects);
      },
      error: (err) => {
        console.error('Error fetching Projects:', err);
      }
    });
  
}
getProjects():Project[]
  {
    return this.myProjects;
  }
    getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }
}




