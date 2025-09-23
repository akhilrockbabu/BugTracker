import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { AdminDashboardComponent } from './Components/admin-dashboard/admin-dashboard';
import { ProjectManagementComponent } from './Components/admin-dashboard/project-management/project-management';
import { ProjectTeamsComponent } from './Components/admin-dashboard/project-teams/project-teams';
import { HomeComponent } from './Components/admin-dashboard/home/home';
import { adminGuard } from './guards/admin-guard';
import { AdminBugComponent } from './Components/admin-dashboard/admin-bug/admin-bug';
import { BugForm } from './Components/bug-form/bug-form';

import { UpdateBug } from './Components/update-bug/update-bug';

import { Users } from './Components/admin-dashboard/users/users';
import { Teams } from './Components/admin-dashboard/teams/teams';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [adminGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'projects', component: ProjectManagementComponent },
            { path: 'projects/:id/teams', component: ProjectTeamsComponent },
            { path: 'bugs', component: AdminBugComponent },   // ✅ no leading slash
            { path: 'user', component: Users },               // ✅ no leading slash
            { path: 'teams', component: Teams },              // ✅ use plural for consistency
            { path: '', redirectTo: 'home', pathMatch: 'full' },
        ]
        
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'bug-form', component: BugForm },
    { path: 'update-bug/:id', component: UpdateBug }
];

