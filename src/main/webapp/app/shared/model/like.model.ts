import { Moment } from 'moment';
import { IPost } from 'app/shared/model//post.model';
import { IUsuario } from 'app/shared/model/usuario.model';

export interface ILike {
    id?: number;
    fechaLike?: Moment;
    post?: IPost;
    usuarioLike?: IUsuario;
}

export class Like implements ILike {
    constructor(public id?: number, public fechaLike?: Moment, public post?: IPost, public usuarioLike?: IUsuario) {}
}
