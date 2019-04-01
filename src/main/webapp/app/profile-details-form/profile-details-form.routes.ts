import { Route } from '@angular/router';
import { ProfileDetailsFormComponent } from './profile-details-form.component';

export const profilesDetailsFormRoute: Route = {
    path: 'profile-details-form',
    component: ProfileDetailsFormComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Detalles del Perfil',
        animation: 'FilterPage'
    }
};
