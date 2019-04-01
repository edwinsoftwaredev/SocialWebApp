import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SocialProjectSharedModule } from 'app/shared';
import {
    FilePostComponent,
    FilePostDetailComponent,
    FilePostUpdateComponent,
    FilePostDeletePopupComponent,
    FilePostDeleteDialogComponent,
    filePostRoute,
    filePostPopupRoute
} from './';

const ENTITY_STATES = [...filePostRoute, ...filePostPopupRoute];

@NgModule({
    imports: [SocialProjectSharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        FilePostComponent,
        FilePostDetailComponent,
        FilePostUpdateComponent,
        FilePostDeleteDialogComponent,
        FilePostDeletePopupComponent
    ],
    entryComponents: [FilePostComponent, FilePostUpdateComponent, FilePostDeleteDialogComponent, FilePostDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SocialProjectFilePostModule {}
