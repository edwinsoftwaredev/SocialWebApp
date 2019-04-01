import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SocialProjectUsuarioModule } from './usuario/usuario.module';
import { SocialProjectPostModule } from './post/post.module';
import { SocialProjectFilePostModule } from './file-post/file-post.module';
import { SocialProjectLikeModule } from './like/like.module';
import { SocialProjectActividadModule } from './actividad/actividad.module';
import { SocialProjectChatModule } from './chat/chat.module';
import { SocialProjectMensajeModule } from './mensaje/mensaje.module';
import { SocialProjectMuroModule } from './muro/muro.module';
import { SocialProjectRelacionModule } from './relacion/relacion.module';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
    // prettier-ignore
    imports: [
        SocialProjectUsuarioModule,
        SocialProjectPostModule,
        SocialProjectFilePostModule,
        SocialProjectLikeModule,
        SocialProjectActividadModule,
        SocialProjectChatModule,
        SocialProjectMensajeModule,
        SocialProjectMuroModule,
        SocialProjectRelacionModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    declarations: [],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SocialProjectEntityModule {}
