import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SocialProjectSharedModule } from 'app/shared';
import {
    MuroComponent,
    MuroDetailComponent,
    MuroUpdateComponent,
    MuroDeletePopupComponent,
    MuroDeleteDialogComponent,
    muroRoute,
    muroPopupRoute
} from './';

const ENTITY_STATES = [...muroRoute, ...muroPopupRoute];

@NgModule({
    imports: [SocialProjectSharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [MuroComponent, MuroDetailComponent, MuroUpdateComponent, MuroDeleteDialogComponent, MuroDeletePopupComponent],
    entryComponents: [MuroComponent, MuroUpdateComponent, MuroDeleteDialogComponent, MuroDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SocialProjectMuroModule {}
