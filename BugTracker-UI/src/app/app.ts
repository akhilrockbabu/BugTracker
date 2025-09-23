import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BugsComponent } from "./Components/bugs.component/bugs.component";
import { LoginComponent } from "./Components/login/login";
import { BugForm } from "./Components/bug-form/bug-form";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoginComponent,  BugForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BugTracker-UI');
   isBugFormVisible = false;

  openBugForm() {
    this.isBugFormVisible = true;
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  closeBugForm() {
    this.isBugFormVisible = false;
    document.body.style.overflow = ''; // restore scroll
  }
}

