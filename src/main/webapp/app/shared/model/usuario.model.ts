import { Moment } from 'moment';
import { IRelacion } from 'app/shared/model//relacion.model';
import { IPost } from 'app/shared/model//post.model';
import { IChat } from 'app/shared/model//chat.model';
import { IActividad } from 'app/shared/model//actividad.model';

export interface IUsuario {
    id?: number;
    usuario?: string;
    primerNombre?: string;
    segundoNombre?: string;
    primerApellido?: string;
    segundoApellido?: string;
    email?: string;
    fechaNacimiento?: Moment;
    fechaRegistro?: Moment;
    profilePicContentType?: string;
    profilePic?: any;
    relacions?: IRelacion[];
    posts?: IPost[];
    chats?: IChat[];
    actividads?: IActividad[];
}

export class Usuario implements IUsuario {
    constructor(
        public id?: number,
        public usuario?: string,
        public primerNombre?: string,
        public segundoNombre?: string,
        public primerApellido?: string,
        public segundoApellido?: string,
        public email?: string,
        public fechaNacimiento?: Moment,
        public fechaRegistro?: Moment,
        public profilePicContentType?: string,
        public profilePic?: any,
        public relacions?: IRelacion[],
        public posts?: IPost[],
        public chats?: IChat[],
        public actividads?: IActividad[]
    ) {}
}
