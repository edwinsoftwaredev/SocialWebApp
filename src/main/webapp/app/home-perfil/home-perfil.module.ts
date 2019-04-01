import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePerfilComponent } from 'app/home-perfil/home-perfil.component';
import { RouterModule } from '@angular/router';
import { SocialProjectSharedModule } from 'app/shared';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HOME_PERFIL_ROUTE } from './home-perfil.routes';
import { profilesDetailsFormRoute } from 'app/profile-details-form/profile-details-form.routes';

@NgModule({
    imports: [
        FormsModule,
        SocialProjectSharedModule,
        RouterModule.forChild([HOME_PERFIL_ROUTE, profilesDetailsFormRoute]),
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
    ],
    declarations: [HomePerfilComponent],
    exports: [RouterModule]
})
export class HomePerfilModule {}
