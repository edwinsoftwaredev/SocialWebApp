import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatBottomSheet, MatDialog, MatDialogRef } from '@angular/material';
import { IUsuario, Usuario } from 'app/shared/model/usuario.model';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
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
import { NewPostModalComponent } from 'app/new-post-modal/new-post-modal.component';
import { MatSnackBar } from '@angular/material';
import { IFilePost } from 'app/shared/model/file-post.model';
import { FormControl } from '@angular/forms';
import { map, debounceTime } from 'rxjs/operators';
import { IMessage, SocketService } from 'app/shared/socket.service';
import { PanelChatComponent } from 'app/panel-chat/panel-chat.component';
import { Router } from '@angular/router';
import { NavbarService } from 'app/layouts/navbar/navbar.service';
import { Chat, IChat } from 'app/shared/model/chat.model';
import { SearchBarService } from 'app/search-bar/search-bar.service';
import { ChatService } from 'app/entities/chat';

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
    selector: 'jhi-home-perfil',
    templateUrl: './home-perfil.component.html',
    styleUrls: ['home-perfil.component.scss']
})
export class HomePerfilComponent implements OnInit, OnDestroy {
    usuario: IUsuario;
    picUrl: any;
    cantAmigos: number;
    cantLikes = 0;
    relaciones: IRelacion[] = [];
    solicitudesRecibidas: IRelacion[] = [];
    usuarioSolicitudesEnviadas: IUsuario[] = [];
    amigos: IUsuario[] = [];
    postUsuario: IPost[] = [];
    postLikesUsuario: IPost[] = [];
    cantPosts: number;
    scrollPage = 0;
    jokerCardText = 'Estos son todos los Posts.';
    scrollFlag = true;
    estadoRightPanel = false;

    fullPosts: IFullPost[] = [];

    cantMsgSinLeer: number;
    usuariosSinLeer: string[] = [];
    noHayPosts: boolean;
    usuariosConectados: IChat[] = [];

    searchProfilesSubscription: Subscription;

    // example
    profileNameCtrl: FormControl;
    filteredProfiles: Observable<IPerfil[]>;
    searchingSpinnerFlag: boolean;

    profiles: IPerfil[] = [];

    @ViewChild('snackBarTemplate')
    snackBarTemplate: TemplateRef<any>;

    snackProfilePicUrlSanitized: any;
    snackProfileName: string;

    usuariosChat: IChat[] = [];

    chatsUsuarios: string[] = [];

    panelChatsOpened = false;

    usuarioLeidoSubscription: Subscription;

    loadingLikeFlag = false;

    constructor(
        private principal: Principal,
        private usuarioService: UsuarioService,
        private relacionService: RelacionService,
        private postService: PostService,
        private dataUtils: JhiDataUtils,
        private likeService: LikeService,
        private sanitizer: DomSanitizer,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private socketService: SocketService,
        private panelChat: MatBottomSheet,
        private router: Router,
        private changeDetectionRef: ChangeDetectorRef,
        private navbarService: NavbarService,
        private searchBarService: SearchBarService,
        private chatService: ChatService
    ) {}

    private _filterProfiles(searchString: string): IPerfil[] {
        const filterValue = searchString.toLowerCase().replace(/\s/g, '');

        // llenar el arreglo profiles con los perfiles de la base
        // para lograr un mejor filtrado concatenar el primer segundo nombre y primer segundo apellido sin espacios
        // ejemplo: edwingerardomartinezpaz

        if (searchString.length !== 0) {
            if (this.searchProfilesSubscription) {
                this.searchProfilesSubscription.unsubscribe();
                this.profiles.length = 0;
                this.profiles = [];
            }

            this.searchingSpinnerFlag = true;

            this.searchProfilesSubscription = this.usuarioService
                .findUsuarioBySearchString(filterValue)
                .subscribe((response: HttpResponse<IUsuario[]>) => {
                    if (response.body) {
                        this.searchingSpinnerFlag = false;

                        response.body.forEach((usuario: IUsuario) => {
                            if (usuario.id !== this.usuario.id) {
                                this.profiles.push({
                                    firstNameLastName:
                                        usuario.primerNombre +
                                        '' +
                                        (usuario.segundoNombre ? usuario.segundoNombre : '') +
                                        '' +
                                        usuario.primerApellido +
                                        '' +
                                        (usuario.segundoApellido ? usuario.segundoApellido : ''),
                                    firstNameLastNameSpaced:
                                        usuario.primerNombre +
                                        ' ' +
                                        (usuario.segundoNombre ? usuario.segundoNombre : '') +
                                        ' ' +
                                        usuario.primerApellido +
                                        ' ' +
                                        (usuario.segundoApellido ? usuario.segundoApellido : ''),
                                    usuario: usuario.usuario,
                                    envieSolicitud: false,
                                    envioSolicitud: false,
                                    amigos: false,
                                    profilePicUrlSanitized: this.getSanitizedUrl(usuario.profilePic, usuario.profilePicContentType),
                                    profilePicContentType: usuario.profilePicContentType,
                                    id: usuario.id
                                });
                            }

                            this.getEstadosBarraBusqueda(); // determinar los estados de la relacion del usuarios con los usuarios filtrados
                        });
                    }
                });
        }

        return this.profiles;
    }

    getCantUsuariosConectados(): number {
        return this.usuariosChat.filter((chat: IChat) => chat.status).length;
    }

    ngOnDestroy(): void {
        if (this.usuarioLeidoSubscription) {
            this.usuarioLeidoSubscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.navbarService.forceCloseSideNavSubject.next(true);

        this.navbarService.statusRightPanelObservable.subscribe((val: boolean) => {
            this.estadoRightPanel = val;
        });

        this.navbarService.refreshUsuario.next(true);

        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        this.usuariosConectados = this.usuariosChat.filter((chat: IChat) => chat.status);

        this.getUsuario();
        this.profileNameCtrl = new FormControl('');

        this.profiles = [];

        this.filteredProfiles = this.profileNameCtrl.valueChanges.pipe(
            debounceTime(1000),
            map(searchString => (searchString ? this._filterProfiles(searchString.toLowerCase()) : (this.profiles = [])))
        );

        this.socketMessages();
        this.observeNewPosts();
        this.observeNewRelaciones();

        // document.getElementById('btnVineta').click(); -> se definio con la propiedad opened = true
    }

    observeNewRelaciones() {
        this.searchBarService.relacionObservable.subscribe((relacion: IRelacion) => {
            if (relacion.usuario.usuario === this.usuario.usuario && relacion.estado === false) {
                // envie solicitud
                // agregar solicitud a enviadas

                this.usuarioService.find(relacion.amigoId).subscribe((res: HttpResponse<IUsuario>) => {
                    if (res.body) {
                        const usuarioAmigo = res.body;
                        this.usuarioSolicitudesEnviadas.push(usuarioAmigo);
                        this.changeDetectionRef.markForCheck();
                    }
                });
            } else if (relacion.usuario.usuario === this.usuario.usuario && relacion.estado === true) {
                // acepte solicitud
                // quitar solicitud de recibidas
                // agregar a amigos

                const indexUser: number = this.solicitudesRecibidas.findIndex((rel: IRelacion) => rel.usuario.id === relacion.amigoId);

                const usuarioAmigo: IUsuario = this.solicitudesRecibidas.filter((rel: IRelacion) => rel.usuario.id === relacion.amigoId)[0]
                    .usuario;

                if (indexUser !== -1) {
                    this.solicitudesRecibidas.splice(indexUser, 1);
                }

                this.amigos.push(usuarioAmigo);
            }
        });
    }

    socketMessages(): void {
        this.socketService.solicitudMessage.subscribe((message: IMessage) => {
            // Recibi una solicitud
            if (message.text === 'solicitudPendiente') {
                message.from.profilePic = this.getSanitizedUrl(message.from.profilePic, message.from.profilePicContentType);
                this.solicitudesRecibidas.push(new Relacion(null, this.usuario.id, false, message.dateTime, message.from));
            } else if (message.text === 'solicitudAceptada') {
                // hay que quitar la solicitud de las solictudes enviadas

                const indexUser: number = this.usuarioSolicitudesEnviadas.findIndex((user: IUsuario) => user.id === message.from.id);

                if (indexUser !== -1) {
                    this.usuarioSolicitudesEnviadas.splice(indexUser, 1);
                }

                // se agrega a la lista de amigos del panel
                this.amigos.push(message.from);
            }
        });

        this.usuariosSinLeer = this.socketService.usuariosSinLeer;
        this.cantMsgSinLeer = this.socketService.chatMessages.length;

        this.socketService.mensageMessage.subscribe((message: IMessage) => {
            if (this.chatsUsuarios.indexOf(message.from.usuario) === -1) {
                this.chatsUsuarios.push(message.from.usuario);
            }

            // si el usuario me envia un mensaje y no tiene chat y lo envia primero
            let usuarioEncontrado = false;

            for (let i = 0; i < this.usuariosChat.length; i++) {
                if (!usuarioEncontrado) {
                    if (this.usuariosChat[i].usuarios.findIndex((usuario: IUsuario) => usuario.usuario === message.from.usuario) !== -1) {
                        usuarioEncontrado = true;
                        this.usuariosChat[i].id = message.chat.id;
                    }
                }
            }

            usuarioEncontrado = false;

            this.cantMsgSinLeer++;

            this.changeDetectionRef.markForCheck();
        });

        this.socketService.connectingMessage.subscribe((message: IMessage) => {
            let usuarioEncontrado = false;

            for (let i = 0; i < this.usuariosChat.length; i++) {
                if (!usuarioEncontrado) {
                    if (this.usuariosChat[i].usuarios.findIndex((usuario: IUsuario) => usuario.usuario === message.from.usuario) !== -1) {
                        usuarioEncontrado = true;
                        this.usuariosChat[i].status = true;
                    }
                }
            }

            if (!usuarioEncontrado) {
                const chat = new Chat(null, null, null, null, [this.usuario, message.from], true);
                this.usuariosChat.push(chat);
            }

            usuarioEncontrado = false;
        });

        this.socketService.desconexionMessage.subscribe((message: IMessage) => {
            let usuarioEncontrado = false;

            for (let i = 0; i < this.usuariosChat.length; i++) {
                if (!usuarioEncontrado) {
                    if (this.usuariosChat[i].usuarios.findIndex((usuario: IUsuario) => usuario.usuario === message.from.usuario) !== -1) {
                        usuarioEncontrado = true;
                        this.usuariosChat[i].status = false;

                        if (this.usuariosChat[i].id === null) {
                            this.usuariosChat.splice(i, 1);
                        }
                    }
                }
            }

            usuarioEncontrado = false;
        });

        this.socketService.usuariosSinLeerObservable.subscribe((usuario: string) => {
            if (this.usuariosSinLeer.indexOf(usuario) === -1) {
                this.usuariosSinLeer.push(usuario);
            }
        });

        this.usuarioLeidoSubscription = this.socketService.usuarioLeidoObservable.subscribe((usuario: string) => {
            // console.log(this.socketService.chatMessages.filter((message: IMessage) => message.from.usuario === usuario).length);

            // se restan la cantidad de mensajes del usuario de la cantidad de mensajes sin leer
            // se pone en timeout porque es posible que el observable de mensajes entrantes se ejecute despues
            // y primero se haga la resta y despues la suma mostandose sola la suma
            setTimeout(() => {
                this.cantMsgSinLeer =
                    this.cantMsgSinLeer -
                    this.socketService.chatMessages.filter((message: IMessage) => message.from.usuario === usuario).length;

                this.changeDetectionRef.markForCheck();
                this.socketService.removeUsuarioSinLeerFromMensajes(usuario);
                if (this.cantMsgSinLeer < 0) {
                    this.cantMsgSinLeer = 0;
                }
                if (this.usuariosSinLeer.indexOf(usuario) !== -1) {
                    this.usuariosSinLeer.splice(this.usuariosSinLeer.indexOf(usuario), 1);
                }
                this.changeDetectionRef.markForCheck();
            }, 500);
        });
    }

    editarPerfil() {
        this.router.navigateByUrl('profile-details-form');
    }

    abrirPanelMensajes(usuarioConectado: IUsuario, chat: IChat): void {
        if (!usuarioConectado.chats) {
            usuarioConectado.chats = undefined;
        }

        chat.usuarios.forEach((usuario: IUsuario) => {
            if (!usuario.chats) {
                usuario.chats = undefined;
            }
        });

        this.panelChat.open(PanelChatComponent, {
            autoFocus: true,
            hasBackdrop: false,
            panelClass: 'panelChat',
            data: [usuarioConectado, this.usuario, chat],
            disableClose: true
        });
    }

    abrirPanelMensajesAmigos(usuario: IUsuario) {
        let usuarioEncontrado = false;
        let chat: IChat = null;

        for (let i = 0; i < this.usuariosChat.length; i++) {
            if (!usuarioEncontrado) {
                if (this.usuariosChat[i].usuarios.findIndex((usr: IUsuario) => usr.usuario === usuario.usuario) !== -1) {
                    usuarioEncontrado = true;
                    chat = this.usuariosChat[i];
                }
            }
        }

        // se supone que el usuario tuvo que estar en el arreglo para desconectarse
        if (!usuarioEncontrado) {
            chat = new Chat(null, null, null, null, [this.usuario, usuario], false);

            this.usuariosChat.push(chat);
        }

        usuarioEncontrado = false;

        this.panelChatsOpened = true;

        this.abrirPanelMensajes(usuario, chat);
    }

    getUsuario() {
        this.principal.identity().then((account: Account) => {
            this.usuarioService.findUsuario(account.login).subscribe(
                (res: HttpResponse<IUsuario>) => {
                    this.usuario = res.body;

                    this.changeDetectionRef.markForCheck();

                    // se crea socket
                    // si el usuario se registra se inicia conexion
                    // this.socketService.initializeWebSocketConnection();

                    // esto se hace para que al enviar el usuario no se envie un arreglo vacio de actividades sino que vaya el valor sin definirse
                    if (res.body.actividads) {
                        this.usuario.actividads = res.body.actividads;
                    } else {
                        this.usuario.actividads = undefined;
                    }

                    if (res.body.chats) {
                        this.usuario.chats = res.body.chats;
                    } else {
                        this.usuario.chats = undefined;
                    }

                    const picUrlString = 'data:' + this.usuario.profilePicContentType + ';base64,' + this.usuario.profilePic;
                    // this.picUrl = this.sanitizer.bypassSecurityTrustUrl(picUrlString);
                    this.picUrl = this.getSanitizedUrl(this.usuario.profilePic, this.usuario.profilePicContentType);

                    this.loadAll();
                },
                (res: HttpResponse<any>) => {
                    // console.log(res.headers.get('content-length') === '0');

                    if (res.headers.get('content-length') === '0') {
                        this.router.navigateByUrl('profile-details-form');
                    }
                }
            );
        });
    }

    eliminarChat(chat: IChat) {
        // si esta conectado no se elimina solo se reinicia el chat de cero.
        if (chat.id) {
            this.chatService.delete(chat.id).subscribe((res: any) => {
                this.usuariosChat.map((value: IChat) => {
                    if (value.id === chat.id) {
                        if (value.status) {
                            value.id = null;
                            value.mensajes = null;

                            const usuario: string = value.usuarios.filter((usr: IUsuario) => usr.usuario !== this.usuario.usuario)[0]
                                .usuario;

                            setTimeout(() => {
                                this.cantMsgSinLeer =
                                    this.cantMsgSinLeer -
                                    this.socketService.chatMessages.filter((message: IMessage) => message.from.usuario === usuario).length;

                                this.changeDetectionRef.markForCheck();
                                this.socketService.removeUsuarioSinLeerFromMensajes(usuario);
                                if (this.cantMsgSinLeer < 0) {
                                    this.cantMsgSinLeer = 0;
                                }
                                if (this.usuariosSinLeer.indexOf(usuario) !== -1) {
                                    this.usuariosSinLeer.splice(this.usuariosSinLeer.indexOf(usuario), 1);
                                }
                                this.changeDetectionRef.markForCheck();
                            }, 500);

                            this.changeDetectionRef.markForCheck();
                        } else {
                            this.usuariosChat.splice(this.usuariosChat.indexOf(chat), 1);
                            this.changeDetectionRef.markForCheck();
                        }
                    }
                });
            });
        } else {
            this.usuariosChat.filter((value: IChat) => value.id === null).map((value: IChat) => {
                if (value.status) {
                    value.id = null;
                    value.mensajes = null;

                    const usuario: string = value.usuarios.filter((usr: IUsuario) => usr.usuario !== this.usuario.usuario)[0].usuario;

                    setTimeout(() => {
                        this.cantMsgSinLeer =
                            this.cantMsgSinLeer -
                            this.socketService.chatMessages.filter((message: IMessage) => message.from.usuario === usuario).length;

                        this.changeDetectionRef.markForCheck();
                        this.socketService.removeUsuarioSinLeerFromMensajes(usuario);
                        if (this.cantMsgSinLeer < 0) {
                            this.cantMsgSinLeer = 0;
                        }
                        if (this.usuariosSinLeer.indexOf(usuario) !== -1) {
                            this.usuariosSinLeer.splice(this.usuariosSinLeer.indexOf(usuario), 1);
                        }
                        this.changeDetectionRef.markForCheck();
                    }, 500);

                    this.changeDetectionRef.markForCheck();
                } else {
                    this.usuariosChat.splice(this.usuariosChat.indexOf(chat), 1);
                    this.changeDetectionRef.markForCheck();
                }
            });
        }
    }

    getChats(): void {
        this.usuarioService.findUsuarioWithChat(this.usuario.id).subscribe((res: HttpResponse<IUsuario>) => {
            if (res.body) {
                this.usuariosChat = res.body.chats;

                this.usuariosChat = this.usuariosChat.filter((chat: IChat) => chat.usuarios.length === 2);

                // usuarios que se conectaron -- sacar solo los que no tiene chat
                this.socketService.connectedMessages.map((message: IMessage) => {
                    let usuarioEncontrado = false;

                    for (let i = 0; i < this.usuariosChat.length; i++) {
                        if (!usuarioEncontrado) {
                            if (
                                this.usuariosChat[i].usuarios.findIndex((usuario: IUsuario) => usuario.usuario === message.from.usuario) !==
                                -1
                            ) {
                                usuarioEncontrado = true;

                                this.usuariosChat[i].status = true;
                            }
                        }
                    }

                    if (!usuarioEncontrado) {
                        this.usuariosChat.push(new Chat(null, null, null, null, [this.usuario, message.from], true));
                    }

                    usuarioEncontrado = false;
                });
            }
        });
    }

    eliminarSolicitudRecibida(relacion: IRelacion) {
        this.relacionService.deleteSolicitudRecibida(relacion.usuario.id, this.usuario.id).subscribe((res: HttpResponse<any>) => {
            this.solicitudesRecibidas.splice(this.solicitudesRecibidas.indexOf(relacion), 1);
            this.changeDetectionRef.markForCheck();
        });
    }

    eliminarSolicitudEnviada(usuario: IUsuario) {
        this.relacionService.deleteSolicitudEnviada(this.usuario.id, usuario.id).subscribe((res: HttpResponse<any>) => {
            this.usuarioSolicitudesEnviadas.splice(this.usuarioSolicitudesEnviadas.indexOf(usuario), 1);
            this.changeDetectionRef.markForCheck();
        });
    }

    eliminarAmigo(usuario: IUsuario) {
        this.relacionService.deleteAmigo(usuario.id, this.usuario.id).subscribe((res: HttpResponse<any>) => {
            this.amigos.splice(this.amigos.indexOf(usuario), 1);
            this.changeDetectionRef.markForCheck();
        });
    }

    loadAll() {
        this.getChats();

        // obteniendo id para chat recien creado
        this.socketService.actualChatIdObservable.subscribe((msg: IMessage) => {
            this.usuariosChat.forEach((chat: IChat) => {
                chat.usuarios.filter((usr: IUsuario) => usr.usuario === msg.to).map((usr: IUsuario) => {
                    chat.id = msg.chat.id;
                });
            });
        });

        // destruir chats
        this.socketService.destruirChatObservable.subscribe((id: string) => {
            this.usuariosChat
                .filter((value: IChat) => !!value.id)
                .filter((value: IChat) => value.id.toString() === id)
                .map((value: IChat) => {
                    value.id = null;
                    value.mensajes = null;
                    this.changeDetectionRef.markForCheck();

                    const usuarioFrom = value.usuarios.filter((usr: IUsuario) => usr.usuario !== this.usuario.usuario)[0];

                    setTimeout(() => {
                        this.cantMsgSinLeer =
                            this.cantMsgSinLeer -
                            this.socketService.chatMessages.filter((message: IMessage) => message.from.usuario === usuarioFrom.usuario)
                                .length;

                        this.changeDetectionRef.markForCheck();
                        this.socketService.removeUsuarioSinLeerFromMensajes(usuarioFrom.usuario);
                        if (this.cantMsgSinLeer < 0) {
                            this.cantMsgSinLeer = 0;
                        }
                        if (this.usuariosSinLeer.indexOf(usuarioFrom.usuario) !== -1) {
                            this.usuariosSinLeer.splice(this.usuariosSinLeer.indexOf(usuarioFrom.usuario), 1);
                        }
                        this.changeDetectionRef.markForCheck();
                    }, 500);
                });
        });

        this.relacionService.findSolicitudesEnvidasByUsuario(this.usuario.id).subscribe((res: HttpResponse<IUsuario[]>) => {
            if (res.body) {
                this.usuarioSolicitudesEnviadas = res.body;
            }
        });

        this.relacionService.findByUsuario(this.usuario.usuario).subscribe((res: HttpResponse<IRelacion[]>) => {
            this.relaciones = res.body;

            // this.relaciones contiene las solicitudes enviadas, es decir, aquellas relaciones(registro) con estado = false
            // y tambien contiene aquellas relaciones(registro) donde define que el usuario es amigo de otro
            // es decir, donde el estado es = true

            this.getCantAmigos();
        });

        this.relacionService.findSolicitudesRecibidasByUsuario(this.usuario.id).subscribe((response: HttpResponse<IRelacion[]>) => {
            this.solicitudesRecibidas = response.body;

            // obtener amigo del usuario

            this.amigos = this.solicitudesRecibidas.filter((relacion: IRelacion) => relacion.estado === true).map((relacion: IRelacion) => {
                return relacion.usuario;
            });

            this.solicitudesRecibidas = this.solicitudesRecibidas
                .filter((relacion: IRelacion) => relacion.estado === false)
                .map((relacion: IRelacion) => {
                    relacion.usuario.profilePic = this.getSanitizedUrl(relacion.usuario.profilePic, relacion.usuario.profilePicContentType);
                    return relacion;
                });
        });

        this.postService.findAllPostsByUsuario(this.usuario.usuario).subscribe((res: HttpResponse<IPost[]>) => {
            this.postUsuario = res.body;

            this.getCantPosts();
        });

        this.postService.findAllLikesPostUsuarioByUsuario(this.usuario.id).subscribe((res: HttpResponse<IPost[]>) => {
            this.postLikesUsuario = res.body;
            this.getCantLikes();
        });

        this.postService.findPostWallByUsuarioIdPageable(this.usuario.id, this.scrollPage, 10).subscribe((res: HttpResponse<IPost[]>) => {
            res.body.map(post => {
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

    getEstadosBarraBusqueda(): void {
        // determinar si el usuario envio solicitud o si son amigos
        this.profiles.map((perfil: IPerfil) => {
            this.relaciones.filter((relacion: IRelacion) => perfil.id === relacion.amigoId).map((relacion: IRelacion) => {
                if (relacion.estado) {
                    perfil.amigos = true;
                } else {
                    perfil.envieSolicitud = true;
                }
            });
        });

        // determinar si al usuario le enviaron solicitud
        // se vuelve a hacer una busqueda de los usuario que ya enviaron una solicitud
        // por ejemplo si los dos usuarios estan conectados al mismos tiempo, si uno envia una solicitud a otro
        // en ese tiempo, en la barra de busqueda del otro usuario debera aparecer que tiene que aceptar la solicitud en lugar
        // de enviar una solicitud

        // ESTA FUNCION DEBERIA DE TENER COMO PARAMETRO LO QUE EL USUARIO VA ESCRIBIENDO EN LA BARRA DE BUSQUEDA
        // PARA HACER RAPIDA LA BUSQUEDA Y NO CARGAR AL CLIENTE

        this.relacionService.findSolicitudesRecibidasByUsuario(this.usuario.id).subscribe((response: HttpResponse<IRelacion[]>) => {
            this.solicitudesRecibidas = response.body;

            this.solicitudesRecibidas = this.solicitudesRecibidas
                .filter((relacion: IRelacion) => relacion.estado === false)
                .map((relacion: IRelacion) => {
                    relacion.usuario.profilePic = this.getSanitizedUrl(relacion.usuario.profilePic, relacion.usuario.profilePicContentType);
                    return relacion;
                });

            this.profiles.map((perfil: IPerfil) => {
                this.solicitudesRecibidas
                    .filter((relacion: IRelacion) => perfil.id === relacion.usuario.id && relacion.estado === false)
                    .map((relacion: IRelacion) => {
                        perfil.envioSolicitud = true;
                    });
            });
        });
    }

    enviarSolicitudBusqueda(event, perfil: IPerfil) {
        event.stopPropagation();

        this.snackProfilePicUrlSanitized = perfil.profilePicUrlSanitized;
        this.snackProfileName = perfil.firstNameLastNameSpaced;

        this.snackBar.openFromTemplate(this.snackBarTemplate, {
            duration: 5000
        });

        const usuarioIdRelacion: IUsuario = new Usuario(this.usuario.id);
        const relacionEnvioSolicitud: IRelacion = new Relacion(null, perfil.id, false, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionEnvioSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            perfil.envieSolicitud = true;
            perfil.amigos = false;
            perfil.envioSolicitud = false;

            this.relaciones.push(relacionResponse.body);
        });
    }

    aceptarSolicitudBusqueda(event, perfil: IPerfil) {
        event.stopPropagation();

        const usuarioIdRelacion: IUsuario = new Usuario(this.usuario.id, this.usuario.usuario);
        const relacionAceptarSolicitud: IRelacion = new Relacion(null, perfil.id, true, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionAceptarSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            perfil.amigos = true;
            perfil.envioSolicitud = false;
            perfil.envieSolicitud = false;

            this.relaciones.push(relacionResponse.body);

            // aqui se cambia el estado en solicitudesRecibidas que es usado en el panel derecho
            // donde se muestran las solicitudes por aceptar

            const usuario: IUsuario = this.solicitudesRecibidas.splice(
                this.solicitudesRecibidas.indexOf(
                    this.solicitudesRecibidas.filter((relacion: IRelacion) => relacion.usuario.id === perfil.id)[0]
                ),
                1
            )[0].usuario;

            this.amigos.push(usuario);

            this.cantAmigos++;
        });
    }

    acertarSolicitudPanel(relacionParam: IRelacion) {
        const usuarioIdRelacion: IUsuario = new Usuario(this.usuario.id, this.usuario.usuario);
        const relacionAceptarSolicitud: IRelacion = new Relacion(null, relacionParam.usuario.id, true, moment(), usuarioIdRelacion);

        this.relacionService.create(relacionAceptarSolicitud).subscribe((relacionResponse: HttpResponse<IRelacion>) => {
            this.relaciones.push(relacionResponse.body);

            this.solicitudesRecibidas.splice(this.solicitudesRecibidas.indexOf(relacionParam), 1);

            this.amigos.push(relacionParam.usuario);

            this.cantAmigos++;
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

    getFechaPublicacionPost(post: IPost): string {
        return post.fechaPublicacion.calendar();
    }

    getSanitizedUrl(file: any, fileContentType: string) {
        if (file) {
            if (file.toString().charAt(0) === 'd') {
                return this.sanitizer.sanitize(4, file);
            } else {
                return this.sanitizer.sanitize(4, 'data:' + fileContentType + ';base64,' + file);
            }
        }
    }

    openFile(file: any, fileContentType: string) {
        return this.dataUtils.openFile(fileContentType, file);
    }

    setLike(post: IFullPost, event) {
        /*const v_post: IPost = new Post(
            post.sourcePost.id,
            post.sourcePost.texto,
            post.sourcePost.url,
            post.sourcePost.fechaPublicacion,
            null,
            null,
            post.sourcePost.usuario
        );*/

        this.loadingLikeFlag = true;

        const v_post: IPost = new Post(post.sourcePost.id, post.sourcePost.texto, post.sourcePost.url, post.sourcePost.fechaPublicacion);

        const usuarioDaLike: IUsuario = new Usuario(
            this.usuario.id,
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

    deleteLike(post: IFullPost, event) {
        this.loadingLikeFlag = true;

        const idLike: number = post.sourcePost.likes.filter(like => like.usuarioLike.id === this.usuario.id)[0].id;

        this.likeService.delete(idLike).subscribe(
            (res: HttpResponse<any>) => {
                post.sourcePost.likes = post.sourcePost.likes.filter(like => like.usuarioLike.id !== this.usuario.id).map(like => like);
                this.loadingLikeFlag = false;
                if (post.sourcePost.usuario.id === this.usuario.id) {
                    this.cantLikes--;
                }
            },
            (res: HttpErrorResponse) => {
                // console.log(res.message);
                this.loadingLikeFlag = false;
            }
        );
    }

    validateLike(postLikes: ILike[]): Boolean {
        if (postLikes) {
            if (postLikes.filter(like => like.usuarioLike !== null).filter(like => like.usuarioLike.id === this.usuario.id)[0]) {
                return false;
            }
        }

        return true;
    }

    validatePostOptions(idUsuarioPost: number) {
        if (idUsuarioPost === this.usuario.id) {
            return true;
        }

        return false;
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<ILike>>, post: IPost) {
        result.subscribe(
            (res: HttpResponse<ILike>) => {
                // console.log('se creo like');
                post.likes.push(res.body);

                if (post.usuario.id === this.usuario.id) {
                    this.cantLikes++;
                }

                this.loadingLikeFlag = false;
            }
            // (res: HttpErrorResponse) => console.log('no se creo like')
        );
    }

    observeNewPosts() {
        this.navbarService.dialogRefObservable.subscribe((dialogRef: MatDialogRef<NewPostModalComponent, IPost>) => {
            this.dialogPostClose(dialogRef, false);
        });
    }

    openNewModalPost(postToEditx?: IPost, editFlag?: Boolean) {
        const dialogRef = this.dialog.open(NewPostModalComponent, {
            width: '40%',
            minWidth: '400px',
            panelClass: 'editPostModal',
            data: {
                postToEdit: postToEditx
            }
        });

        this.dialogPostClose(dialogRef, true);
    }

    dialogPostClose(dialogRef: MatDialogRef<NewPostModalComponent, IPost>, editFlag?: Boolean) {
        dialogRef.beforeClosed().subscribe((post: IPost) => {
            if (post) {
                post.likes = [];

                const postImagesArray: IImageFullPost[] = [];
                const postFilesArray: IFileFullPost[] = [];

                if (post.filePosts) {
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
                }

                // si se edito el post solo se cambian los campos del post
                if (editFlag) {
                    // console.log(post);

                    this.fullPosts.filter(postx => postx.sourcePost.id === post.id).map((postx: IFullPost) => {
                        postx.sourcePost.texto = post.texto;
                        postx.sourcePost.url = post.url;
                        postx.sourcePost.filePosts = post.filePosts;
                        postx.filesPost = postFilesArray;
                        postx.postImages = postImagesArray;
                    });
                } else {
                    this.fullPosts.unshift({
                        sourcePost: post,
                        postImages: postImagesArray,
                        filesPost: postFilesArray,
                        fechaPublicacionPost: this.getFechaPublicacionPost(post),
                        profilePicSanitized: this.getSanitizedUrl(post.usuario.profilePic, post.usuario.profilePicContentType)
                    });

                    /*if (this.usuario.id === post.usuario.id) {
                        this.cantPosts++;
                    }*/

                    this.snackBar.open('Creaste un nuevo Post', null, {
                        duration: 2500
                    });

                    this.noHayPosts = false;
                }
            }
        });
    }

    eliminarPost(post: IPost) {
        // eliminar de manera completa el post es decir full post

        this.postService.deleteFullPost(post.id).subscribe(
            (res: HttpResponse<any>) => {
                this.fullPosts = this.fullPosts.filter((postx: IFullPost) => postx.sourcePost.id !== post.id);

                if (this.usuario.id === post.usuario.id) {
                    this.cantLikes = this.cantLikes - post.likes.length;
                    this.cantPosts--;
                    if (this.fullPosts.length === 0) {
                        this.noHayPosts = true;
                    }
                }
            },
            (res: HttpErrorResponse) => {
                // console.log(res.message);
            }
        );
    }

    muroScrolled() {
        this.scrollPage++;

        if (this.scrollFlag) {
            this.jokerCardText = 'Cargando Posts Anteriores...';

            this.postService
                .findPostWallByUsuarioIdPageable(this.usuario.id, this.scrollPage, 10)
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
