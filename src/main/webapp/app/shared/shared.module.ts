import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateMomentAdapter } from './util/datepicker-adapter';
import { SocialProjectSharedLibsModule, SocialProjectSharedCommonModule, JhiLoginModalComponent, HasAnyAuthorityDirective } from './';
import { NewPostModalComponent } from 'app/new-post-modal/new-post-modal.component';
import { DemoMaterialModule } from 'app/shared/material';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NewLoginComponent } from './new-login/new-login.component';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { SnackbarSocketServiceAceptadaComponent, SnackbarSocketServiceComponent } from 'app/shared/socket.service';
import { DialogOverviewExampleDialogComponent } from 'app/profile-details-form/profile-details-form.component';

@NgModule({
    imports: [
        SocialProjectSharedLibsModule,
        SocialProjectSharedCommonModule,
        DemoMaterialModule,
        FileUploadModule,
        ReactiveFormsModule,
        FormsModule,
        Ng2ImgMaxModule
    ],
    declarations: [
        JhiLoginModalComponent,
        HasAnyAuthorityDirective,
        NewPostModalComponent,
        NewLoginComponent,
        DialogOverviewExampleDialogComponent,
        SnackbarSocketServiceComponent,
        SnackbarSocketServiceAceptadaComponent
    ],
    providers: [{ provide: NgbDateAdapter, useClass: NgbDateMomentAdapter }],
    entryComponents: [
        JhiLoginModalComponent,
        NewPostModalComponent,
        NewLoginComponent,
        DialogOverviewExampleDialogComponent,
        SnackbarSocketServiceComponent,
        SnackbarSocketServiceAceptadaComponent
    ],
    exports: [
        SocialProjectSharedCommonModule,
        JhiLoginModalComponent,
        HasAnyAuthorityDirective,
        NewPostModalComponent,
        DemoMaterialModule,
        FileUploadModule,
        ReactiveFormsModule,
        FormsModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SocialProjectSharedModule {}
