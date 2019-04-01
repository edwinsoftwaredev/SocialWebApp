import { NewRegisterComponent } from './new-register.component';
import { Route } from '@angular/router';

export const newRegisterRoute: Route = {
    path: 'register',
    component: NewRegisterComponent,
    data: {
        authorities: [],
        pageTitle: 'Registro',
        animation: 'registrar'
    }
};
