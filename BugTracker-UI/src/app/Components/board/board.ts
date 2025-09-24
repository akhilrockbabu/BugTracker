import { Component, OnInit } from '@angular/core';
import { BugService } from '../../Services/bug.service';
import { Bug } from '../../Models/bug.models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-board',
  standalone:true,
  imports: [FormsModule,CommonModule],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board implements OnInit {
  openBugs: Bug[] = [];
  inProgressBugs: Bug[] = [];
  closedBugs: Bug[] = [];
  page = 1;
  pageSize = 10;
  //statusFilter: string = '';
  assignedToFilter?: number;
  teamId?: number;
 
  constructor(private bugService: BugService) {}
 
  ngOnInit(): void {
    // const userId = localStorage.getItem('userId');
    // const storedTeamId = localStorage.getItem('teamId');
 
    // if (userId) {
    //   this.assignedToFilter = Number(userId);
    // }
    // if (storedTeamId) {
    //   this.teamId = Number(storedTeamId);
    // }
 
    this.loadBugs();
  }
 
  loadBugs() {
    this.bugService.getBugsBoard('Open', this.assignedToFilter,  this.page, this.pageSize,this.teamId).subscribe(data => this.openBugs = data);
    this.bugService.getBugsBoard('In Progress', this.assignedToFilter, this.page, this.pageSize, this.teamId).subscribe(data => this.inProgressBugs = data);
    this.bugService.getBugsBoard('Closed', this.assignedToFilter, this.page, this.pageSize, this.teamId).subscribe(data => this.closedBugs = data);
  }
 
  // onPageChange(newPage: number) {
  //   this.page = newPage;
  //   this.loadBugs();
  // }
  nextPage() {
    this.page++;
    this.loadBugs();
  }
 
  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadBugs();
    }
  }
 
  applyFilters() {
    this.page = 1;
    this.loadBugs();
  }
}
 
 