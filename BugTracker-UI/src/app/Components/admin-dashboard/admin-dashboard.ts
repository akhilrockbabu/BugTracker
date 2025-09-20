import { Component } from '@angular/core';
import { Users } from "../users/users";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-admin-dashboard',
  imports: [ RouterOutlet, RouterLink, RouterLinkActive ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent{

}
