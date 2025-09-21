import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../Services/project';
import { TeamService } from '../../../Services/team';
import { Project } from '../../../Models/project.models';
import { Team } from '../../../Models/team.models';
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
  assignedTeams: Team[] = [];
  availableTeams: Team[] = [];
  projectId!: number;
  assignTeamForm!: FormGroup;
  errorMessage: string = '';
  teamId! : number;


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

      this.assignedTeams = assigned;
      this.availableTeams = all.filter(team => team.projectId === 0);
    

      this.cdr.detectChanges();
    });
  }

  onAssignTeamSubmit(): void {
    if (this.assignTeamForm.invalid) return;
    this.errorMessage = '';
    const teamIdToAssign = +this.assignTeamForm.value.teamToAssign;

    const teamToUpdate = this.availableTeams.find(t => t.teamId === teamIdToAssign);

    if (!teamToUpdate)
    {
      this.errorMessage = 'Selected team not found. Please refresh.';
      return;
    }

    const updatedTeamPayload: Team = {
      ...teamToUpdate, // Copy existing teamId and teamName
      projectId: this.projectId // Set the new projectId
    };

    this.teamService.updateTeam(updatedTeamPayload).subscribe({
      next: () => {
        // On success, reset the form and reload both lists to show the change
        this.assignTeamForm.reset();
        this.loadTeamData();
      },
      error: (err) => {
        this.errorMessage = 'Failed to assign the team. Please try again.';
        console.error(err);
      }
    });
  }

  removeTeamFromProject(teamToRemove : Team) : void
  {
    if(!confirm(`Are you Sure you want to remove the team ${teamToRemove.teamName} from this ${this.project?.projectName} ?`))
    {
      return;
    }

    this.errorMessage = '';

    const updatedTeamPayload: Team = {
      ...teamToRemove,
      projectId: 0 // Set projectId to 0 to mark as unassigned
    };

    this.teamService.updateTeam(updatedTeamPayload).subscribe({
      next: () => {
        // On success, refresh both lists to reflect the change
        this.loadTeamData();
      },
      error: (err) => {
        this.errorMessage = 'Failed to remove the team. Please try again.';
        console.error(err);
      }
    });

  }
}

