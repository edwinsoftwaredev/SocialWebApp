import { Moment } from 'moment';
import { IChat } from 'app/shared/model//chat.model';

export interface IMensaje {
    id?: number;
    texto?: string;
    fechaCreacion?: Moment;
    chat?: IChat;
}

export class Mensaje implements IMensaje {
    constructor(public id?: number, public texto?: string, public fechaCreacion?: Moment, public chat?: IChat) {}
}
