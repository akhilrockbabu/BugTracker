import { Component, OnInit } from '@angular/core';
import { BugService } from '../../Services/bug.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Bug } from '../../Models/bug.models';
 
@Component({
  selector: 'app-allbugs',
  standalone:true,
  imports: [FormsModule,CommonModule],
  templateUrl: './allbugs.html',
  styleUrl: './allbugs.css'
})
export class Allbugs implements OnInit{
  allBugs: Bug[]=[];
  bugs: Bug[] = [];
  page = 1;
  pageSize = 10;
  statusFilter: string = '';
  //assignedToFilter?: number;
  teamId?: number;
  createdBy?: number;
 
  filterType: 'assignedTo' | 'createdBy' = 'assignedTo';
  userId?: number;
 
  constructor(private bugService: BugService) {}
 
  ngOnInit(): void {
    const storedUserId = Number(localStorage.getItem('userId'));
    // const storedTeamId = localStorage.getItem('teamId');
 
    if (storedUserId) {
      this.userId = Number(storedUserId);
    }
    // if (storedTeamId) {
    //   this.teamId = Number(storedTeamId);
    // }
 
    this.loadBugs();
  }
 
  loadBugs() {
    this.bugService
    .getBugsBoard(this.statusFilter, undefined, this.page, this.pageSize, this.teamId, undefined)
    .subscribe((data) => {
      // Keep all bugs in memory
      let allBugs = data;
 
      if (this.filterType === 'assignedTo' && this.userId) {
        this.bugs = allBugs.filter(bug => bug.assignedTo === this.userId);
      }
      else if (this.filterType === 'createdBy' && this.userId) {
        this.bugs = allBugs.filter(bug => bug.createdBy === this.userId);
      }
      else {
        this.bugs = allBugs;
      }
    });
}
    // let assignedTo: number | undefined = undefined;
    // let createdBy: number | undefined = undefined;
 
    // if (this.filterType === 'assignedTo') {
    //   assignedTo = this.userId;
    // } else {
    //   createdBy = this.userId;
    // }
 
    // this.bugService
    //   .getBugsBoard(this.statusFilter, assignedTo, this.page, this.pageSize, this.teamId, createdBy)
    //   .subscribe((data) => {
    //     this.bugs = data;
    //   });
 
 
 
    // this.bugService
    //   .getBugs(this.statusFilter, this.filterType, this.page, this.pageSize, this.teamId)
    //   .subscribe((data) => {
    //     this.bugs = data;
    //   });
 
  openSelect(event: MouseEvent) {
  const select = event.target as HTMLSelectElement;
  select.focus();
  setTimeout(() => {
    select.click();
  }, 0);
}
 
  onFilterTypeChange(newType: 'assignedTo' | 'createdBy') {
    this.filterType = newType;
    this.page = 1;
    this.loadBugs();
  }
 
  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadBugs();
  }
}
 
 