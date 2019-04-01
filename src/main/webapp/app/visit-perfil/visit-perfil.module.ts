import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitPerfilComponent } from './visit-perfil.component';
import { RouterModule } from '@angular/router';
import { SocialProjectSharedModule } from 'app/shared';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { visitPerfil } from './visit-perfil.route';

@NgModule({
    imports: [
        FormsModule,
        SocialProjectSharedModule,
        RouterModule.forChild(visitPerfil),
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
    ],
    declarations: [VisitPerfilComponent],
    exports: [RouterModule]
})
export class VisitPerfilModule {}
