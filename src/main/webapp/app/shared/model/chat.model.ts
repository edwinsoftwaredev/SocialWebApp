import { Moment } from 'moment';
import { IMensaje } from 'app/shared/socket.service';
import { IUsuario } from 'app/shared/model//usuario.model';

export interface IChat {
    id?: number;
    fechaCreacion?: Moment;
    ultimaVezVisto?: Moment;
    mensajes?: IMensaje[];
    usuarios?: IUsuario[];
    status?: boolean;
}

export class Chat implements IChat {
    constructor(
        public id?: number,
        public fechaCreacion?: Moment,
        public ultimaVezVisto?: Moment,
        public mensajes?: IMensaje[],
        public usuarios?: IUsuario[],
        public status?: boolean
    ) {}
}
