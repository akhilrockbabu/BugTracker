import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BugsComponent } from "./Components/bugs.component/bugs.component";
import { LoginComponent } from "./Components/login/login";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BugTracker-UI');
}
