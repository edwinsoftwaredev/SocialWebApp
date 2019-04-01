import { Route } from '@angular/router';

import { RegisterComponent } from './register.component';

export const registerRoute: Route = {
    path: 'oldregister', // se modifico register por oldregistre para que ahora la aplicacion al registrar apunte al nuevo componenete de registro
    component: RegisterComponent,
    data: {
        authorities: [],
        pageTitle: 'Registration'
    }
};
