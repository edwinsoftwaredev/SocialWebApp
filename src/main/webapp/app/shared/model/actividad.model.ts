import { Moment } from 'moment';
import { IUsuario } from 'app/shared/model//usuario.model';

export interface IActividad {
    id?: number;
    nombreActividad?: string;
    fechaInicio?: Moment;
    fechaFin?: Moment;
    usuarios?: IUsuario[];
}

export class Actividad implements IActividad {
    constructor(
        public id?: number,
        public nombreActividad?: string,
        public fechaInicio?: Moment,
        public fechaFin?: Moment,
        public usuarios?: IUsuario[]
    ) {}
}
