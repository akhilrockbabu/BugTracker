import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IUser, UserService } from '../../Services/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  selectedUsers: IUser | null = null;
  SelectedRole: string = '';
  searchTerm:string='';
  sortField?: keyof IUser  ;
  sortDirection :'asc'|'desc'|'' = '';
  newUser: any = { userName: '', userEmail: '', role: '', password: '' };
  constructor(public userService: UserService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.userService.users$.subscribe(data => {
      this.users = data;
      this.filterByRole();

    });
    this.userService.getUsers();
  }
  //  loadUser(){
  //   this.userService.getUsers().subscribe(data=> {
  //     console.log(data);
  //     this.users=[...data];
  //     this.cdr.detectChanges();
  //   });
  //  }
  addUser() {
    this.userService.createUser(this.newUser).subscribe((createdUser) => {
      // this.loadUser();
      // this.users=[...this.users,createdUser]
      this.newUser = { userName: '', userEmail: '', role: '', password: '' };
      // this.cdr.detectChanges();
      // this.userService.createUser(this.newUser);
    })
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe()
    // {
    //    next: () => {
    //     this.users = this.users.filter(u => u.userId !== id); 
    //     this.cdr.detectChanges();
    //   }}
    // );
  }
  updateUser(user: IUser) {
    const updatePayload = {
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role
    };
    this.userService.updateUser(user.userId, updatePayload).subscribe()
    // ()=>{
    //   // this.userService.getUsers();
    // })
  }
  selectedUser: IUser | null = null;

  getUserById(id: number) {
    this.userService.getUserById(id).subscribe(user => {
      this.selectedUser = user;
      console.log("Selected user:", user);
    });
  }
  filterByRole() {
    this.applyFilter();
  }
  applyFilter() {
    let result = [...this.users];
    if (this.SelectedRole) {
      result = result.filter(u => u.role === this.SelectedRole);
    }
    if(this.searchTerm){
      result=result.filter(u=>
        u.userName.toLocaleLowerCase().includes(this.searchTerm.toLowerCase())||
        u.userEmail.toLocaleLowerCase().includes(this.searchTerm.toLowerCase())
      )
    }
    
    if(this.sortDirection && this.sortField){
     result= result.sort((a,b) => {
        const valueA=a[this.sortField! ] ?? '';
        const valueB=b[this.sortField !] ?? '';
        if(valueA<valueB)
          return this.sortDirection==='asc' ? -1:1;
        else if(valueB<valueA)
          return this.sortDirection==='desc' ?1:-1;
        return 0;
      })
    }
    this.filteredUsers = result;
    this.cdr.detectChanges();
  }
  sortBy(field:keyof IUser){
    if(this.sortField===field){
      if(this.sortDirection === 'asc'){
        this.sortDirection='desc';
      }
      else if(this.sortDirection === 'desc'){
        this.sortDirection = ''; // Reset sort
        this.sortField = undefined;
      }
    }
    else{
      this.sortField=field;
      this.sortDirection='asc';
    }
    this.applyFilter();

  }
  // sortBy(field: keyof IUser) {
  //   if (this.sortField === field) {
  //     if (this.sortDirection === 'asc') {
  //       this.sortDirection = 'desc';
  //     } else if (this.sortDirection === 'desc') {
  //       this.sortDirection = '';
  //       this.sortField = undefined;
  //     }
  //   } else {
  //     this.sortField = field;
  //     this.sortDirection = 'asc';
  //   }
  //   this.applyFilter();
  // }
}
