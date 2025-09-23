import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'https://localhost:7062/api/users'; // Adjust API endpoint as needed
  private users: User[] = [];     // 👈 store users here

  constructor(private http: HttpClient) {
    this.http.get<User[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.users = data;
        console.log('Users loaded:', this.users);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
      }
    });
  }

  // fetch users and store them in the lis

  // return stored users
  getAllUsers(): User[] {
    return this.users;
  }
}
