import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if(token && userRole === 'Admin')
    return true;
  else
  {
    return router.createUrlTree(['login']);
  }
};
