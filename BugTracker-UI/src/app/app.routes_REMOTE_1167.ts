import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { AdminDashboardComponent } from './Components/admin-dashboard/admin-dashboard';
import { ProjectManagementComponent } from './Components/project-management/project-management';
import { BugForm } from './Components/bug-form/bug-form';
import { Navbar } from './Components/navbar/navbar';
import { App } from './app';
import { UpdateBug } from './Components/update-bug/update-bug';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component:App},
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'admin/projects', component: ProjectManagementComponent },
    {path:'bug-form',component:BugForm},
    {path:'update-bug/:id',component:UpdateBug}
];
