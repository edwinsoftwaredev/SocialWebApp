import { Moment } from 'moment';
import { IFilePost } from 'app/shared/model//file-post.model';
import { ILike } from 'app/shared/model//like.model';
import { IUsuario } from 'app/shared/model//usuario.model';

export interface IPost {
    id?: number;
    texto?: string;
    url?: string;
    fechaPublicacion?: Moment;
    filePosts?: IFilePost[];
    likes?: ILike[];
    usuario?: IUsuario;
}

export class Post implements IPost {
    constructor(
        public id?: number,
        public texto?: string,
        public url?: string,
        public fechaPublicacion?: Moment,
        public filePosts?: IFilePost[],
        public likes?: ILike[],
        public usuario?: IUsuario
    ) {}
}
