import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { BugService, Bug, AdminGetAllBugs } from '../../../Services/bug.service';

@Component({
  selector: 'app-admin-bug',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-bug.html',
  styleUrls: ['./admin-bug.css']
})
export class AdminBugComponent implements OnInit {
  allBugs: AdminGetAllBugs[] = [];
  filteredBugs: AdminGetAllBugs[] = [];
  paginatedBugs: AdminGetAllBugs[] = []; // The slice of bugs for the current page
  filterForm!: FormGroup;

  // --- NEW PROPERTIES FOR PAGINATION ---
  currentPage: number = 1;
  pageSize: number = 5; // Show 10 bugs per page
  totalBugsCount: number = 0;
  // ------------------------------------

  Math = Math;

  // Static data for our filter dropdowns
  priorities: string[] = ['High', 'Medium', 'Low'];
  statuses: string[] = ['Open', 'In Progress', 'Closed'];

  constructor(
    private bugService: BugService,
    private fb: FormBuilder,
    private cdr : ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      priority: [''],
      status: ['']
    });

    this.loadBugs();


    this.filterForm.valueChanges.subscribe(filters => {
      this.applyFiltersAndPagination();
    });
  }

  

  loadBugs(): void {

    this.bugService.getAllBugs().subscribe(bugs => {
      this.allBugs = bugs;
      console.log(this.allBugs);
      this.filteredBugs = bugs; 
      this.applyFiltersAndPagination(); // Apply initial filters and set the first page
      this.cdr.detectChanges();
    });
  }

  applyFiltersAndPagination(): void {
    const { searchTerm, priority, status } = this.filterForm.value;
    let tempBugs = [...this.allBugs];
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      tempBugs = tempBugs.filter(bug =>
        bug.title.toLowerCase().includes(lowerCaseSearch)
      );
    }
    if (priority) {
      tempBugs = tempBugs.filter(bug => bug.priority === priority);
    }
    if (status) {
      tempBugs = tempBugs.filter(bug => bug.status === status);
    }
    this.filteredBugs = tempBugs;
    this.totalBugsCount = this.filteredBugs.length;
    this.currentPage = 1; // Reset to the first page whenever filters change
    this.updatePaginatedBugs();
    this.cdr.detectChanges();
  }

  updatePaginatedBugs(): void {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.paginatedBugs = this.filteredBugs.slice(startIndex, endIndex);
  }

  resetFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      priority: '',
      status: ''
    });

    this.cdr.detectChanges();
  }

  nextPage(): void {
    const totalPages = Math.ceil(this.totalBugsCount / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updatePaginatedBugs();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedBugs();
    }
  }
}
