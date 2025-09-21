import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, concatAll, findIndex, forkJoin, observable, Observable } from 'rxjs';
import { environment } from './environment';
// import { error } from 'console';

export interface IUser { userId: number, userName: string; userEmail: string; role: string; password: string ;hasTeam?: boolean;teamName:string[];}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  apiUrl = environment.apiUrl + 'users';
  private usersSubject = new BehaviorSubject<IUser[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) { }

getUsers():void{
  this.http.get<IUser[]>(this.apiUrl).subscribe(users=>{
   // Fetch teams for each user
      const teamRequests = users.map(u => 
        this.http.get<{ teamNames: string[] }>(`${this.apiUrl}/${u.userId}/teams`)
      );

      forkJoin(teamRequests).subscribe(results => {
        results.forEach((res, i) => {
          users[i].teamName = res.teamNames;
        });
        this.usersSubject.next(users);
      });
    });
}
  // getUsers(): void {
  //   this.http.get<IUser[]>(this.apiUrl).subscribe(users => {
  //     const hasTeamRequests = users.map(u =>
  //     this.http.get<{ hasTeam: boolean }>(`${this.apiUrl}/${u.userId}/has-team`)
  //   );
  //   forkJoin(hasTeamRequests).subscribe(results=>{
  //     results.forEach((res,index)=>{
  //       users[index].hasTeam=res.hasTeam;
  //     })
  //     this.usersSubject.next(users);
  //   })
  //   });
  // }

  createUser(user: Partial<IUser>): Observable<IUser> {
    console.log(user);
    // return this.http.post<IUser>(this.apiUrl,user);
    return new Observable<IUser>(ob => {
      this.http.post<IUser>(this.apiUrl, user).subscribe(
        {
          next: createdUser => {
            const current = this.usersSubject.getValue();
            this.usersSubject.next([...current, createdUser])
            ob.next(createdUser);
            ob.complete();
          },
          error: err => ob.error(err)
        });
    });
  }
  // getUser():void{
  //   this.http.get<IUser[]>(this.apiUrl).subscribe(this)
  // }

  deleteUser(id: number): Observable<void> {
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    return new Observable<void>(observer => {
      this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          const current = this.usersSubject.getValue();
          this.usersSubject.next(current.filter(u => u.userId != id));
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  updateUser(id: number, user: Partial<IUser>): Observable<IUser> {
    // return this.http.put<IUser>(`${this.apiUrl}/${id}`,user);
    return new Observable<IUser>(observable => {
      this.http.put<IUser>(`${this.apiUrl}/${id}`, user).subscribe({
        next: updatedUser => {
          const current = this.usersSubject.getValue();
          const index = current.findIndex(u => u.userId === id);
          if (index != -1) {
            const updatedUsers = [...current];
            updatedUsers[index] = { ...updatedUsers[index], ...updatedUser };
            this.usersSubject.next(updatedUsers);
          }
          observable.next(updatedUser);
          observable.complete();
        },
        error: err => observable.error(err)
      });
    });
  }
  getUserById(id: number): Observable<IUser> {
  const current = this.usersSubject.getValue();
  const found = current.find(u => u.userId === id);

  if (found) {
    return new BehaviorSubject<IUser>(found).asObservable();
  }

  return this.http.get<IUser>(`${this.apiUrl}/${id}`);
}

}

