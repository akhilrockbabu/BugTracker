import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardService } from '../../../Services/admindashboard';
import { AdminSummary } from '../../../Models/admin.dashboard.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {

  summary$!: Observable<AdminSummary>;

  constructor(private admindashboardService: AdminDashboardService) {}

  ngOnInit(): void 
  {
    this.summary$ = this.admindashboardService.getAdminSummary();
  }
}