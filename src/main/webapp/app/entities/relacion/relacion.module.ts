import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SocialProjectSharedModule } from 'app/shared';
import {
    RelacionComponent,
    RelacionDetailComponent,
    RelacionUpdateComponent,
    RelacionDeletePopupComponent,
    RelacionDeleteDialogComponent,
    relacionRoute,
    relacionPopupRoute
} from './';

const ENTITY_STATES = [...relacionRoute, ...relacionPopupRoute];

@NgModule({
    imports: [SocialProjectSharedModule, RouterModule.forChild(ENTITY_STATES)],
    declarations: [
        RelacionComponent,
        RelacionDetailComponent,
        RelacionUpdateComponent,
        RelacionDeleteDialogComponent,
        RelacionDeletePopupComponent
    ],
    entryComponents: [RelacionComponent, RelacionUpdateComponent, RelacionDeleteDialogComponent, RelacionDeletePopupComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SocialProjectRelacionModule {}
