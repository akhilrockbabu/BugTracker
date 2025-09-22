import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { AdminDashboardComponent } from './Components/admin-dashboard/admin-dashboard';
import { ProjectManagementComponent } from './Components/project-management/project-management';
import { BugForm } from './Components/bug-form/bug-form';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'admin/projects', component: ProjectManagementComponent },
    {path:'bug-form',component:BugForm}
];
