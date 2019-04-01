// mysql://f4awq21e1qejb1oe:devtvbg80eiwi0r3@g8mh6ge01lu2z3n1.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/tsnx8l93k21ius5l?useUnicode=true&characterEncoding=UTF-8
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDrawer } from '@angular/material';
import { IUsuario, Usuario } from 'app/shared/model/usuario.model';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Account, Principal } from 'app/core';
import { UsuarioService } from 'app/entities/usuario';
import { RelacionService } from 'app/entities/relacion';
import { IRelacion, Relacion } from 'app/shared/model/relacion.model';
import { PostService } from 'app/entities/post';
import { IPost, Post } from 'app/shared/model/post.model';
import { JhiDataUtils } from 'ng-jhipster';
import { ILike, Like } from 'app/shared/model/like.model';
import { LikeService } from 'app/entities/like';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { IFilePost } from 'app/shared/model/file-post.model';
import { map, startWith, filter, debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { NavbarService } from 'app/layouts/navbar/navbar.service';

export interface IPerfil {
    firstNameLastName: string;
    firstNameLastNameSpaced: string;
    usuario: string;
    amigos: boolean;
    envieSolicitud: boolean;
    envioSolicitud: boolean;
    profilePicUrlSanitized: any;
    profilePicContentType: string;
    id: number;
}

@Component({
    selector: 'jhi-visit-perfil',
    templateUrl: './visit-perfil.component.html',
    styleUrls: ['./visit-perfil.component.scss']
})
export class VisitPerfilComponent implements OnInit {
    iconFlag: Boolean = true;
    usuario: IUsuario;
    picUrl: any;
    cantAmigos: number;
    cantLikes = 0;
    relaciones: IRelacion[];
    postUsuario: IPost[];
    postLikesUsuario: IPost[];
    cantPosts: number;
    scrollPage = 0;
    jokerCardText = 'Estos son todos los Posts.';
    scrollFlag = true;
    estadoRightPanel = false;

    usuarioVisitorName: string; // usuario del que visita el perfil
    usuarioVisitor: IUsuario;
    sonAmigos: boolean;
    usuarioVisitedEnvioSolicitud: boolean;
    usuarioVisitorEnvioSolicitud: boolean;

    fullPosts: IFullPost[] = [];

    amigos: IUsuario[] = [];

    perfilVistado: IPerfil;

    @ViewChild('snackBarTemplate')
    snackBarTemplate: TemplateRef<any>;

    snackProfilePicUrlSanitized: any;
    snackProfileName: string;

    noHayPosts: boolean;

    loadingLikeFlag = false;

    constructor(
        private principal: Principal,
        private usuarioService: UsuarioService,
        private relacionService: RelacionService,
        private postService: PostService,
        private dataUtils: JhiDataUtils,
        private likeService: LikeService,
        private sanitizer: DomSanitizer,
        public snackBar: MatSnackBar,
        private activateRoute: ActivatedRoute,
        private navbarService: NavbarService
    ) {}

    ngOnInit() {
        this.principal.identity().then((account: Account) => {
            this.usuarioVisitorName = account.login;

            this.usuarioService.findUsuario(this.usuarioVisitorName).subscribe(
                (usuarioResponse: HttpResponse<IUsuario>) => {
                    this.usuarioVisitor = usuarioResponse.body;
                    this.getUsuario();
                },
                (err: HttpErrorResponse) => {
                    // *
                }
            );
        });

        this.navbarService.statusRightPanelObservable.subscribe((val: boolean) => {
            this.estadoRightPanel = val;
        });
    }

    toggleBar(drawer: MatDrawer): void {
        drawer.toggle();
        this.iconFlag = !this.iconFlag;
    }

    getUsuario() {
        this.activateRoute.data.subscribe(({ usuario }) => {
            this.fullPosts.length = 0;
            this.fullPosts = [];

            this.usuario = usuario;

            // esto se hace para que al enviar el usuario no se envie un arreglo vacio de actividades sino que vaya el valor sin definirse
            if (this.usuario.actividads.length === 0) {
                this.usuario.actividads = null;
            }

            const picUrlString = 'data:' + this.usuario.profilePicContentType + ';base64,' + this.usuario.profilePic;
            this.picUrl = this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType);

            this.loadAll();
        });
    }

    loadAll() {
        this.relacionService.findByUsuario(this.usuario.usuario).subscribe((res: HttpResponse<IRelacion[]>) => {
            this.relaciones = res.body;

            const rel: IRelacion = this.relaciones.filter((relacion: IRelacion) => relacion.amigoId === this.usuarioVisitor.id)[0];

            if (rel) {
                if (rel.amigoId === this.usuarioVisitor.id && rel.estado === true) {
                    this.sonAmigos = true;
                    this.usuarioVisitedEnvioSolicitud = false;
                    this.usuarioVisitorEnvioSolicitud = false;

                    this.perfilVistado = {
                        firstNameLastName:
                            this.usuario.primerNombre +
                            '' +
                            this.usuario.segundoNombre +
                            '' +
                            this.usuario.primerApellido +
                            '' +
                            this.usuario.segundoApellido,
                        firstNameLastNameSpaced:
                            this.usuario.primerNombre +
                            ' ' +
                            this.usuario.segundoNombre +
                            ' ' +
                            this.usuario.primerApellido +
                            ' ' +
                            this.usuario.segundoApellido,
                        usuario: this.usuario.usuario,
                        amigos: this.sonAmigos,
                        envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                        envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                        profilePicUrlSanitized: this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType),
                        profilePicContentType: this.usuario.profilePicContentType,
                        id: this.usuario.id
                    };
                } else if (rel.amigoId === this.usuarioVisitor.id && rel.estado === false) {
                    this.sonAmigos = false;
                    this.usuarioVisitedEnvioSolicitud = true;
                    this.usuarioVisitorEnvioSolicitud = false;

                    this.perfilVistado = {
                        firstNameLastName:
                            this.usuario.primerNombre +
                            '' +
                            this.usuario.segundoNombre +
                            '' +
                            this.usuario.primerApellido +
                            '' +
                            this.usuario.segundoApellido,
                        firstNameLastNameSpaced:
                            this.usuario.primerNombre +
                            ' ' +
                            this.usuario.segundoNombre +
                            ' ' +
                            this.usuario.primerApellido +
                            ' ' +
                            this.usuario.segundoApellido,
                        usuario: this.usuario.usuario,
                        amigos: this.sonAmigos,
                        envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                        envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                        profilePicUrlSanitized: this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType),
                        profilePicContentType: this.usuario.profilePicContentType,
                        id: this.usuario.id
                    };
                }
            } else {
                this.relacionService.findByUsuario(this.usuarioVisitor.usuario).subscribe((responseVisitor: HttpResponse<IRelacion[]>) => {
                    const rel2: IRelacion = responseVisitor.body.filter((relacion: IRelacion) => relacion.amigoId === this.usuario.id)[0];

                    if (rel2) {
                        if (rel2.amigoId === this.usuario.id && rel2.estado === false) {
                            this.sonAmigos = false;
                            this.usuarioVisitedEnvioSolicitud = false;
                            this.usuarioVisitorEnvioSolicitud = true;

                            this.perfilVistado = {
                                firstNameLastName:
                                    this.usuario.primerNombre +
                                    '' +
                                    this.usuario.segundoNombre +
                                    '' +
                                    this.usuario.primerApellido +
                                    '' +
                                    this.usuario.segundoApellido,
                                firstNameLastNameSpaced:
                                    this.usuario.primerNombre +
                                    ' ' +
                                    this.usuario.segundoNombre +
                                    ' ' +
                                    this.usuario.primerApellido +
                                    ' ' +
                                    this.usuario.segundoApellido,
                                usuario: this.usuario.usuario,
                                amigos: this.sonAmigos,
                                envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                                envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                                profilePicUrlSanitized: this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType),
                                profilePicContentType: this.usuario.profilePicContentType,
                                id: this.usuario.id
                            };
                        }
                    } else {
                        this.sonAmigos = false;
                        this.usuarioVisitedEnvioSolicitud = false;
                        this.usuarioVisitorEnvioSolicitud = false;

                        this.perfilVistado = {
                            firstNameLastName:
                                this.usuario.primerNombre +
                                '' +
                                this.usuario.segundoNombre +
                                '' +
                                this.usuario.primerApellido +
                                '' +
                                this.usuario.segundoApellido,
                            firstNameLastNameSpaced:
                                this.usuario.primerNombre +
                                ' ' +
                                this.usuario.segundoNombre +
                                ' ' +
                                this.usuario.primerApellido +
                                ' ' +
                                this.usuario.segundoApellido,
                            usuario: this.usuario.usuario,
                            amigos: this.sonAmigos,
                            envioSolicitud: this.usuarioVisitedEnvioSolicitud,
                            envieSolicitud: this.usuarioVisitorEnvioSolicitud,
                            profilePicUrlSanitized: this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType),
                            profilePicContentType: this.usuario.profilePicContentType,
                            id: this.usuario.id
                        };
                    }
                });
            }

            this.relacionService.findSolicitudesRecibidasByUsuario(this.usuario.id).subscribe((response: HttpResponse<IRelacion[]>) => {
                // obtener amigo del usuario
                this.amigos = response.body.filter((relacion: IRelacion) => relacion.estado === true).map((relacion: IRelacion) => {
                    return relacion.usuario;
                });
            });

            // this.relaciones contiene las solicitudes enviadas, es decir, aquellas relaciones(registro) con estado = false
            // y tambien contiene aquellas relaciones(registro) donde define que el usuario es amigo de otro
            // es decir, donde el estado es = true

            this.getCantAmigos();
        });

        this.postService.findAllPostsByUsuario(this.usuario.usuario).subscribe((res: HttpResponse<IPost[]>) => {
            this.postUsuario = res.body;

            this.getCantPosts();
        });

        this.postService.findAllLikesPostUsuarioByUsuario(this.usuario.id).subscribe((res: HttpResponse<IPost[]>) => {
            this.postLikesUsuario = res.body;
            this.getCantLikes();
        });

        this.postService
            .findPostWallByUsuarioIdPageableVisitedProfile(this.usuario.id, this.scrollPage, 10)
            .subscribe((res: HttpResponse<IPost[]>) => {
                res.body.filter((post: IPost) => post.usuario.usuario === this.usuario.usuario).map(post => {
                    const postImagesArray: IImageFullPost[] = [];
                    const postFilesArray: IFileFullPost[] = [];

                    post.filePosts
                        .filter((file: IFilePost) => file.fileContentType.substr(file.fileContentType.indexOf('image'), 5) === 'image')
                        .map(file => {
                            postImagesArray.push(new ImageFullPost(this.getSanitizedUrl(file.file, file.fileContentType), 'imagen'));
                        });

                    post.filePosts
                        .filter((file: IFilePost) => file.fileContentType.substr(file.fileContentType.indexOf('image'), 5) !== 'image')
                        .map(file => {
                            postFilesArray.push(new FileFullPost(file.file, file.fileContentType, 'File'));
                        });

                    this.fullPosts.push({
                        sourcePost: post,
                        postImages: postImagesArray,
                        filesPost: postFilesArray,
                        fechaPublicacionPost: this.getFechaPublicacionPost(post),
                        profilePicSanitized: this.getSanitizedUrl(post.usuario.profilePic, post.usuario.profilePicContentType)
                    });

                    this.jokerCardText = 'Estos son todos los Posts.';
                    if (this.fullPosts.length !== 0) {
                        this.noHayPosts = false;
                    }
                });

                if (res.body.length === 0) {
                    this.noHayPosts = true;
                }
            });
    }

    getCantAmigos() {
        this.cantAmigos = this.relaciones.filter(function(relacion) {
            return relacion.estado === true;
        }).length;
    }

    getCantPosts() {
        this.cantPosts = this.postUsuario.length;
    }

    getCantLikes() {
        if (this.postLikesUsuario) {
            this.postLikesUsuario.map(post => {
                this.cantLikes += post.likes.length;
            });
        } else {
            this.cantLikes = 0;
        }
    }

    enviarSolicitudBusqueda(event) {
        event.stopPropagation();

        this.snackProfilePicUrlSanitized = this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType);
        this.snackProfileName = this.perfilVistado.firstNameLastNameSpaced;

        this.snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000
        });

        const usuarioIdRelacion: IUsuario = new Usuario(this.usuarioVisitor.id);
        const relacionEnvioSolicitud: IRelacion = new Relacion(null, this.perfilVistado.id, false, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionEnvioSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            this.perfilVistado.envieSolicitud = true;
            this.perfilVistado.amigos = false;
            this.perfilVistado.envioSolicitud = false;

            this.relaciones.push(relacionResponse.body);
        });
    }

    aceptarSolicitudBusqueda(event) {
        event.stopPropagation();

        // console.log(this.perfilVistado.usuario);

        const usuarioIdRelacion: IUsuario = new Usuario(this.usuarioVisitor.id);
        const relacionAceptarSolicitud: IRelacion = new Relacion(null, this.perfilVistado.id, true, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionAceptarSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            this.perfilVistado.amigos = true;
            this.perfilVistado.envioSolicitud = false;
            this.perfilVistado.envieSolicitud = false;

            this.relaciones.push(relacionResponse.body);

            this.cantAmigos++;
        });
    }

    getFechaPublicacionPost(post: IPost): string {
        return post.fechaPublicacion.calendar();
    }

    getSanitizedUrl(file: any, fileContentType: string) {
        if (file) {
            return this.sanitizer.sanitize(4, 'data:' + fileContentType + ';base64,' + file);
        }
    }

    openFile(file: any, fileContentType: string) {
        return this.dataUtils.openFile(fileContentType, file);
    }

    setLike(post: IFullPost) {
        this.loadingLikeFlag = true;

        /*const v_post: IPost = new Post(
            post.sourcePost.id,
            post.sourcePost.texto,
            post.sourcePost.url,
            post.sourcePost.fechaPublicacion,
            null,
            null,
            post.sourcePost.usuario
        );*/

        const v_post: IPost = new Post(post.sourcePost.id, post.sourcePost.texto, post.sourcePost.url, post.sourcePost.fechaPublicacion);

        const usuarioDaLike: IUsuario = new Usuario(
            this.usuarioVisitor.id,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );
        // el server solo necesita el id del usuario que da like sino se genera nullpointerexception por jackson

        const newLike: ILike = new Like(undefined, moment(), v_post, usuarioDaLike);

        this.subscribeToSaveResponse(this.likeService.create(newLike), post.sourcePost); // aqui se envia el post para hacer push un like de la base
    }

    deleteLike(post: IFullPost) {
        this.loadingLikeFlag = true;

        const idLike: number = post.sourcePost.likes.filter(like => like.usuarioLike.id === this.usuarioVisitor.id)[0].id;

        this.likeService.delete(idLike).subscribe(
            (res: HttpResponse<any>) => {
                post.sourcePost.likes = post.sourcePost.likes
                    .filter(like => like.usuarioLike.id !== this.usuarioVisitor.id)
                    .map(like => like);

                if (post.sourcePost.usuario.id === this.usuarioVisitor.id) {
                    this.cantLikes--;
                }

                this.loadingLikeFlag = false;
            },
            (res: HttpErrorResponse) => {
                // console.log(res.message);
                this.loadingLikeFlag = false;
            }
        );
    }

    validateLike(postLikes: ILike[]): Boolean {
        if (postLikes) {
            if (postLikes.filter(like => like.usuarioLike !== null).filter(like => like.usuarioLike.id === this.usuarioVisitor.id)[0]) {
                return false;
            }
        }

        return true;
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<ILike>>, post: IPost) {
        result.subscribe(
            (res: HttpResponse<ILike>) => {
                // console.log('se creo like');
                post.likes.push(res.body);

                this.loadingLikeFlag = false;

                if (post.usuario.id === this.usuario.id) {
                    this.cantLikes++;
                }
            },
            (res: HttpErrorResponse) => {
                console.log('');
                this.loadingLikeFlag = false;
            }
        );
    }

    muroScrolled() {
        this.scrollPage++;

        if (this.scrollFlag) {
            this.jokerCardText = 'Cargando Posts Anteriores...';

            this.postService
                .findPostWallByUsuarioIdPageableVisitedProfile(this.usuario.id, this.scrollPage, 10)
                .subscribe((res: HttpResponse<IPost[]>) => {
                    if (res.body.length) {
                        res.body.map((post: IPost) => {
                            const postImagesArray: IImageFullPost[] = [];
                            const postFilesArray: IFileFullPost[] = [];

                            post.filePosts
                                .filter(
                                    (file: IFilePost) => file.fileContentType.substr(file.fileContentType.indexOf('image'), 5) === 'image'
                                )
                                .map(file => {
                                    postImagesArray.push(
                                        new ImageFullPost(this.getSanitizedUrl(file.file, file.fileContentType), 'imagen')
                                    );
                                });

                            post.filePosts
                                .filter(
                                    (file: IFilePost) => file.fileContentType.substr(file.fileContentType.indexOf('image'), 5) !== 'image'
                                )
                                .map(file => {
                                    postFilesArray.push(new FileFullPost(file.file, file.fileContentType, 'File'));
                                });

                            this.fullPosts.push({
                                sourcePost: post,
                                postImages: postImagesArray,
                                filesPost: postFilesArray,
                                fechaPublicacionPost: this.getFechaPublicacionPost(post),
                                profilePicSanitized: this.getSanitizedUrl(post.usuario.profilePic, post.usuario.profilePicContentType)
                            });
                        });
                    } else {
                        this.jokerCardText = 'Estos son todos los Posts.';
                        this.scrollFlag = false;
                    }
                });
        }
    }
}

export interface IFullPost {
    sourcePost?: IPost;
    postImages?: IImageFullPost[];
    filesPost?: IFileFullPost[];
    profilePicSanitized?: any;
    fechaPublicacionPost?: string;
}

export class FullPost implements IFullPost {
    constructor(
        public sourcePost?: IPost,
        public postImages?: IImageFullPost[],
        public filesPost?: IFileFullPost[],
        public profilePicSanitized?: any,
        public fechaPublicacionPost?: string
    ) {}
}

export interface IImageFullPost {
    sanitizedUrl?: any;
    imageName?: string;
}

export class ImageFullPost implements IImageFullPost {
    constructor(public sanitizedUrl?: any, public imageName?: string) {}
}

export interface IFileFullPost {
    src?: any;
    fileContentType?: string;
    fileName?: string;
}

export class FileFullPost implements IFileFullPost {
    constructor(public src?: any, public fileContentType?: string, public fileName?: string) {}
}
