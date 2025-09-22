import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { LabelService } from './app/Services/label.service';
import { ProjectService } from './app/Services/project';
import { TeamService } from './app/Services/team.service';
import { UserService } from './app/Services/user.service';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
