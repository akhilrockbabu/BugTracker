import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { LabelService } from './Services/label.service';
import { ProjectService } from './Services/project';
import { TeamService } from './Services/team.service';
import { UserService } from './Services/user.service';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    UserService,
    TeamService,
    ProjectService,
    LabelService
  ]
};
