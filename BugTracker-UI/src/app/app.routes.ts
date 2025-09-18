import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
