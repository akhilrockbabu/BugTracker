import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../Services/project';
import { TeamService, ITeam } from '../../../Services/team';
import { Project } from '../../../Models/project.models';
import { switchMap, forkJoin } from 'rxjs';

@Component({
  selector: 'app-project-teams',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './project-teams.html',
  styleUrls: ['./project-teams.css']
})
export class ProjectTeamsComponent implements OnInit {
  project: Project | null = null;
  assignedTeams: ITeam[] = [];
  availableTeams: ITeam[] = [];
  projectId!: number;
  assignTeamForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private teamService: TeamService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.assignTeamForm = this.fb.group({
      teamToAssign: ['', Validators.required]
    });

    this.route.paramMap.pipe(
      switchMap(params => {
        this.projectId = +params.get('id')!;
        return this.projectService.getProjectById(this.projectId);
      })
    ).subscribe(project => {
      this.project = project;
      if (this.project) {
        this.loadTeamData();
      }
      this.cdr.detectChanges();
    });
  }

  loadTeamData(): void {
    forkJoin({
      assigned: this.teamService.getTeamsByProjectId(this.projectId),
      all: this.teamService.getAllTeams()
    }).subscribe(({ assigned, all }) => {
      // normalize optional projectId
      this.assignedTeams = assigned.map(t => ({ ...t, projectId: t.projectId ?? 0 }));
      this.availableTeams = all.filter(t => !t.projectId || t.projectId === 0);
      this.cdr.detectChanges();
    });
  }

  onAssignTeamSubmit(): void {
    if (this.assignTeamForm.invalid) return;
    this.errorMessage = '';
    const teamIdToAssign = +this.assignTeamForm.value.teamToAssign;
    const teamToUpdate = this.availableTeams.find(t => t.teamId === teamIdToAssign);

    if (!teamToUpdate) {
      this.errorMessage = 'Selected team not found. Please refresh.';
      return;
    }

    const updatedTeamPayload: ITeam = { ...teamToUpdate, projectId: this.projectId };
    this.teamService.updateTeam(updatedTeamPayload).subscribe({
      next: () => {
        this.assignTeamForm.reset();
        this.loadTeamData();
      },
      error: err => { this.errorMessage = 'Failed to assign the team.'; console.error(err); }
    });
  }

  removeTeamFromProject(teamToRemove: ITeam): void {
    if (!confirm(`Are you sure you want to remove ${teamToRemove.teamName} from ${this.project?.projectName}?`))
      return;

    const updatedTeamPayload: ITeam = { ...teamToRemove, projectId: 0 };
    this.teamService.updateTeam(updatedTeamPayload).subscribe({
      next: () => this.loadTeamData(),
      error: err => { this.errorMessage = 'Failed to remove the team.'; console.error(err); }
    });
  }
}
