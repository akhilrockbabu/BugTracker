import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { AdminDashboardComponent } from './Components/admin-dashboard/admin-dashboard';
import { ProjectManagementComponent } from './Components/admin-dashboard/project-management/project-management';
import { ProjectTeamsComponent } from './Components/admin-dashboard/project-teams/project-teams';
import { HomeComponent } from './Components/admin-dashboard/home/home';
import { adminGuard } from './guards/admin-guard';
import { BugForm } from './Components/bug-form/bug-form';
import { UpdateBug } from './Components/update-bug/update-bug';
import { UserDashboard } from './Components/user-dashboard/user-dashboard';
import { userGuardGuard } from './guards/user-guard-guard';
import { UserHome } from './Components/user-home/user-home';
import { BugsListComponent } from './Components/bug-list-component/bug-list-component';
import { BugComponent } from './Components/bug/bug';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ---------- ADMIN ----------
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'projects', component: ProjectManagementComponent },
      { path: 'projects/:id/teams', component: ProjectTeamsComponent },
    ],
  },

  // ---------- USER ----------
  {
    path: 'user',
    component: UserDashboard,
    canActivate: [userGuardGuard],
    children: [
      { path: 'home', component: UserHome },
      {path:'bug/:id',component:BugComponent},
      { path: 'projects/:id', component: BugsListComponent },

      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  // ---------- MODALS ----------
  { path: 'bug-form', component: BugForm, outlet: 'modal' },
  { path: 'update-bug/:id', component: UpdateBug,outlet:'modal' },


  // ---------- OTHER ----------
];
