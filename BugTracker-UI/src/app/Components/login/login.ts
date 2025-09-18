import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../../Models/auth.models';
import { AuthService } from '../../Services/auth';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent
{
  loginData : LoginRequest = {
    LoginIdentifier : '',
    Password : ''
  };

  errorMessage : string = '';

  constructor(private authService : AuthService, private router : Router)
  {

  }

  onSubmit() : void
  {
    this.errorMessage = "";
    if(!this.loginData.LoginIdentifier || !this.loginData.Password)
    {
      this.errorMessage = 'Please enter both username/email and password.';
      return;
    }
    this.authService.login(this.loginData).subscribe({
      next : (response) => {
        console.log("Login Successfull",response);
        this.errorMessage = "Login Successfull"
      },
      error : (err) => {
        console.error('Login Failed', err);
        this.errorMessage = "Invalid credentials.."
      }
    });
  }
}
