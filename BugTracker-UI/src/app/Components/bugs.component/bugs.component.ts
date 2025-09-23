import { Component, OnInit } from '@angular/core';
import { BugService } from '../../Services/bug.service';
import { FormsModule } from '@angular/forms';
import { Bug } from '../../Models/bug.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bugs',
  standalone:true,
  imports: [FormsModule,CommonModule],
  templateUrl: './bugs.component.html',
  styleUrl: './bugs.component.css'
})
export class BugsComponent implements OnInit {
  bugs: Bug[] = [];
  page = 1;
  pageSize = 10;
  statusFilter: string = '';
  assignedToFilter?: number;
  teamId?: number;

  constructor(private bugService: BugService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    const storedTeamId = localStorage.getItem('teamId');

    if (userId) {
      this.assignedToFilter = Number(userId);
    }
    if (storedTeamId) {
      this.teamId = Number(storedTeamId);
    }

    this.loadBugs();
  }

  loadBugs() {
    this.bugService
      .getBugs(this.statusFilter, this.assignedToFilter, this.page, this.pageSize, this.teamId)
      .subscribe((data) => {
        this.bugs = data;
      });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadBugs();
  }
}