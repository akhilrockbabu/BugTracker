import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { AdminDashboardComponent } from './Components/admin-dashboard/admin-dashboard';
import { Users } from './Components/users/users';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        children: [
            { path: 'users', component: Users }
        ]
    }
];
