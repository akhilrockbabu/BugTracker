import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})


export class LoginComponent implements OnInit
{
  loginForm!: FormGroup;
  apiErrorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private cdr : ChangeDetectorRef) 
  { 

  }

  ngOnInit(): void 
  {
    this.loginForm = this.fb.group({
      loginIdentifier: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get loginIdentifier() 
  {
    return this.loginForm.get('loginIdentifier');
  }

  get password() 
  {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    this.apiErrorMessage = '';

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userRole', response.role);
        localStorage.setItem('userId', response.userId.toString());
        localStorage.setItem('userName', response.userName);

        console.log("Login Successfull!", response)
        if (response.role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } 
      },
      error: (err) => {
        console.error('Login failed', err);
        this.apiErrorMessage = 'Invalid credentials. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}