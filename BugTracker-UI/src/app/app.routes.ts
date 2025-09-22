import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { AdminDashboardComponent } from './Components/admin-dashboard/admin-dashboard';
import { ProjectManagementComponent } from './Components/admin-dashboard/project-management/project-management';
import { ProjectTeamsComponent } from './Components/admin-dashboard/project-teams/project-teams';
import { HomeComponent } from './Components/admin-dashboard/home/home';
import { adminGuard } from './guards/admin-guard';
import { AdminBugComponent } from './Components/admin-dashboard/admin-bug/admin-bug';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate : [adminGuard],
        children: 
        [
            { path: 'home', component: HomeComponent },
            { path: '', redirectTo: 'home', pathMatch: 'full'},
            { path: 'projects', component: ProjectManagementComponent },
            { path: 'projects/:id/teams', component : ProjectTeamsComponent },
            { path: 'bugs', component : AdminBugComponent }
        ] 
    },
];
