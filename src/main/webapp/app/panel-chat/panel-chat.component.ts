import { AfterViewChecked, ChangeDetectorRef, Component, DoCheck, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { IUsuario } from 'app/shared/model/usuario.model';
import { DomSanitizer } from '@angular/platform-browser';
import { IMessage, Mensaje, Message, SocketService } from 'app/shared/socket.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Chat, IChat } from 'app/shared/model/chat.model';
import { MensajeService } from 'app/entities/mensaje';
import { HttpResponse } from '@angular/common/http';
import { IMensaje } from 'app/shared/socket.service';
import { UsuarioService } from 'app/entities/usuario';
import { ProfilePanelService } from 'app/profile-panel/profile-panel.service';

@Component({
    selector: 'jhi-panel-chat',
    templateUrl: './panel-chat.component.html',
    styleUrls: ['./panel-chat.component.scss']
})
export class PanelChatComponent implements OnInit, DoCheck, AfterViewChecked {
    usuarioConectado: IUsuario;
    mensajes: IMessage[] = [];
    msgInput: string;
    usuarioActual: IUsuario;
    abierto: boolean;
    selectFlag: boolean;

    suscriptionConnectingMessage: Subscription;
    suscDesconexionMessage: Subscription;
    suscMensageMessage: Subscription;
    destruirChatSubscription: Subscription;
    actualChatIdSubscription: Subscription;

    usuariosSinLeer: string[] = [];

    chat: IChat = null;
    chat1: IChat = null;
    usuariosChat: IChat[] = [];
    chatId: number = null;

    paginaMensajes = 0;
    masMensajes = true;
    cargandoMensajes = false;
    mensajeAnterior: IMessage = null;

    @ViewChild('scrollChat')
    scrollChat: ElementRef;

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data,
        private panelRef: MatBottomSheetRef<PanelChatComponent>,
        private sanitizer: DomSanitizer,
        private socketService: SocketService,
        private changeDetectionRef: ChangeDetectorRef,
        private mensajeService: MensajeService,
        private usuarioService: UsuarioService,
        private profilePanelService: ProfilePanelService
    ) {
        if (data) {
            this.usuarioConectado = data[0];
            this.usuarioActual = data[1];
            this.chat = data[2];
        }
    }

    // funcion que es llamada por angular despues de hacer check
    // se usa para cambiar la posicion del chat
    ngDoCheck(): void {
        document.getElementsByClassName('panelChat').item(0).parentElement.style.marginLeft = '70%';
    }

    ngAfterViewChecked(): void {
        try {
            if (this.scrollChat.nativeElement.scrollTop === this.scrollChat.nativeElement.scrollHeight) {
                this.scrollChat.nativeElement.scrollTop = this.scrollChat.nativeElement.scrollHeight;
            }
        } catch (e) {
            console.log(e.toString());
        }
    }

    ngOnInit() {
        document.getElementsByClassName('panelChat').item(0).parentElement.style.marginLeft = '70%';

        if (this.chat.id !== null && typeof this.chat !== 'undefined') {
            this.chatId = this.chat.id;
        }

        this.changeDetectionRef.markForCheck();

        this.getChats();

        this.usuariosSinLeer = this.socketService.usuariosSinLeer;
        this.cargarMensajesAnteriores();
        this.getMessages();

        this.profilePanelService.closeChatPanelObservable.subscribe(val => {
            this.minimizarPanel();
        });
    }

    getChats(): void {
        this.usuarioService.findUsuarioWithChat(this.usuarioActual.id).subscribe((res: HttpResponse<IUsuario>) => {
            if (res.body) {
                this.usuariosChat = res.body.chats;

                this.chat = this.usuariosChat.filter((chat: IChat) => {
                    return chat.usuarios
                        .map((usuario: IUsuario) => {
                            return usuario.usuario === this.usuarioConectado.usuario;
                        })
                        .filter((val: boolean) => val)[0];
                })[0];

                this.changeDetectionRef.markForCheck();

                if (typeof this.chat !== 'undefined' && this.chat !== null) {
                    this.chatId = this.chat.id;
                    this.changeDetectionRef.markForCheck();
                } else {
                    this.chat = new Chat(null, null, null, null, [this.usuarioActual, this.usuarioConectado], false);

                    this.usuariosChat.push(this.chat);

                    this.changeDetectionRef.markForCheck();
                }

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
                                this.changeDetectionRef.markForCheck();
                            }
                        }
                    }

                    if (!usuarioEncontrado) {
                        this.usuariosChat.push(new Chat(null, null, null, null, [this.usuarioActual, message.from], true));
                        this.changeDetectionRef.markForCheck();
                    }

                    usuarioEncontrado = false;
                });
            }
        });
    }

    cargarMensajesAnteriores() {
        if (this.chatId !== null) {
            this.cargandoMensajes = true;
            this.changeDetectionRef.markForCheck();

            this.mensajeService.findMensajesGuardados(this.chatId, this.paginaMensajes, 10).subscribe((res: HttpResponse<IMensaje[]>) => {
                if (!res.body || res.body.length === 0) {
                    this.masMensajes = false;
                }

                this.changeDetectionRef.markForCheck();

                if (res.body) {
                    res.body.map((mensaje: IMensaje) => {
                        const message: IMessage = new Message(
                            mensaje.usuario.usuario === this.usuarioActual.usuario ? this.usuarioActual : mensaje.usuario,
                            mensaje.texto,
                            mensaje.usuario.usuario === this.usuarioActual.usuario
                                ? this.usuarioConectado.usuario
                                : this.usuarioActual.usuario,
                            mensaje.fechaCreacion,
                            false,
                            false,
                            false,
                            true,
                            mensaje.chat,
                            mensaje
                        );

                        this.mensajes.unshift(message);

                        // separador
                        // se elimina marcador anterior con la misma fecha del mensaje entrante

                        if (
                            this.mensajes.findIndex((msg: IMessage) => {
                                if (msg.from.usuario === this.usuarioActual.usuario && msg.to === this.usuarioActual.usuario) {
                                    if (
                                        msg.from.usuario === this.usuarioActual.usuario &&
                                        msg.to === this.usuarioActual.usuario &&
                                        moment(mensaje.fechaCreacion)
                                            .subtract(12, 'hours')
                                            .format('dddd, MMMM Do YYYY') === msg.text
                                    ) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                } else {
                                    return false;
                                }
                            }) !== -1
                        ) {
                            this.mensajes.splice(
                                this.mensajes.findIndex((msg: IMessage) => {
                                    if (msg.from.usuario === this.usuarioActual.usuario && msg.to === this.usuarioActual.usuario) {
                                        if (
                                            msg.from.usuario === this.usuarioActual.usuario &&
                                            msg.to === this.usuarioActual.usuario &&
                                            moment(mensaje.fechaCreacion)
                                                .subtract(12, 'hours')
                                                .format('dddd, MMMM Do YYYY') === msg.text
                                        ) {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                }),
                                1
                            );
                        }

                        if (this.mensajeAnterior === null) {
                            this.mensajes.unshift(
                                new Message(
                                    this.usuarioActual,
                                    moment(mensaje.fechaCreacion)
                                        .subtract(12, 'hours')
                                        .format('dddd, MMMM Do YYYY'),
                                    this.usuarioActual.usuario,
                                    mensaje.fechaCreacion,
                                    false,
                                    false,
                                    false,
                                    false,
                                    mensaje.chat,
                                    mensaje
                                )
                            );
                        } else {
                            this.mensajes.unshift(
                                new Message(
                                    this.usuarioActual,
                                    moment(mensaje.fechaCreacion)
                                        .subtract(12, 'hours')
                                        .format('dddd, MMMM Do YYYY'),
                                    this.usuarioActual.usuario,
                                    mensaje.fechaCreacion,
                                    false,
                                    false,
                                    false,
                                    false,
                                    mensaje.chat,
                                    mensaje
                                )
                            );
                        }

                        // no repetir imagen de perfil en chat
                        if (this.mensajes.length > 2) {
                            if (
                                this.mensajes[1].from.usuario === this.usuarioConectado.usuario &&
                                this.mensajes[2].from.usuario === this.usuarioConectado.usuario
                            ) {
                                this.mensajes[2].from.profilePic = null;
                            }
                        }

                        this.mensajeAnterior = message;
                    });

                    this.cargandoMensajes = false;
                    this.changeDetectionRef.markForCheck();
                } else if (res.body.length === 0) {
                    this.masMensajes = false;
                    this.changeDetectionRef.markForCheck();
                }
            });

            this.paginaMensajes++;
        }
    }

    selectedUser() {
        this.changeDetectionRef.markForCheck();

        this.usuarioConectado = this.chat.usuarios.filter((usuario: IUsuario) => usuario.usuario !== this.usuarioActual.usuario)[0];

        this.socketService.removeUsuarioSinLeer(this.usuarioConectado.usuario);

        this.chatId = this.chat.id;

        this.suscriptionConnectingMessage.unsubscribe();
        this.suscDesconexionMessage.unsubscribe();
        this.suscMensageMessage.unsubscribe();

        this.mensajes.length = 0;
        this.mensajes = [];
        this.paginaMensajes = 0;
        this.masMensajes = true;
        this.cargandoMensajes = false;
        this.mensajeAnterior = null;

        this.changeDetectionRef.markForCheck();

        this.cargarMensajesAnteriores();
        this.getMessages();
        this.selectFlag = true;

        this.changeDetectionRef.markForCheck();
    }

    getMessages(): void {
        this.socketService.removeUsuarioSinLeer(this.usuarioConectado.usuario);
        this.changeDetectionRef.markForCheck();

        this.actualChatIdSubscription = this.socketService.actualChatIdObservable.subscribe((msg: IMessage) => {
            this.chatId = msg.chat.id;
            this.changeDetectionRef.markForCheck();
        });

        /*if (!this.selectFlag) {
            this.usuariosConectados = this.socketService.connectedMessages.map((message: IMessage) => {
                return message.from;
            });
        }*/

        this.suscriptionConnectingMessage = this.socketService.connectingMessage.subscribe((message: IMessage) => {
            let usuarioEncontrado = false;

            for (let i = 0; i < this.usuariosChat.length; i++) {
                if (!usuarioEncontrado) {
                    if (this.usuariosChat[i].usuarios.findIndex((usuario: IUsuario) => usuario.usuario === message.from.usuario) !== -1) {
                        usuarioEncontrado = true;

                        this.usuariosChat[i].status = true;
                        this.changeDetectionRef.markForCheck();

                        /*this.usuariosChat.push(new Chat(this.usuariosChat[i].id,
                            this.usuariosChat[i].fechaCreacion,
                            this.usuariosChat[i].ultimaVezVisto,
                            null,
                            this.usuariosChat[i].usuarios,
                            true)); */
                    }
                }
            }

            if (!usuarioEncontrado) {
                this.usuariosChat.push(new Chat(null, null, null, null, [this.usuarioActual, message.from], true));
                this.changeDetectionRef.markForCheck();
            }

            usuarioEncontrado = false;
        });

        this.suscDesconexionMessage = this.socketService.desconexionMessage.subscribe((message: IMessage) => {
            let usuarioEncontrado = false;

            for (let i = 0; i < this.usuariosChat.length; i++) {
                if (!usuarioEncontrado) {
                    if (this.usuariosChat[i].usuarios.findIndex((usuario: IUsuario) => usuario.usuario === message.from.usuario) !== -1) {
                        usuarioEncontrado = true;
                        this.usuariosChat[i].status = false;
                        this.changeDetectionRef.markForCheck();
                    }
                }
            }

            usuarioEncontrado = false;
        });

        this.panelRef.afterOpened().subscribe(any => {
            this.abierto = true;
        });

        this.destruirChatSubscription = this.socketService.destruirChatObservable.subscribe((id: string) => {
            if (this.chatId.toString() === id) {
                this.minimizarPanel();
                this.changeDetectionRef.markForCheck();
            } else {
                this.usuariosChat = this.usuariosChat
                    .filter((value: IChat) => !!value.id)
                    .filter((value: IChat) => value.id.toString() !== id);
                this.changeDetectionRef.markForCheck();
            }
        });

        this.socketService.chatMessages
            .filter((message: IMessage) => message.from.usuario !== this.usuarioConectado.usuario)
            .map((message: IMessage) => {
                return message;
            });

        this.suscMensageMessage = this.socketService.mensageMessage.subscribe((message: IMessage) => {
            if (
                (message.from.usuario === this.usuarioConectado.usuario && message.to === this.usuarioActual.usuario) ||
                (message.from.usuario === this.usuarioActual.usuario && message.to === this.usuarioConectado.usuario)
            ) {
                if (this.abierto) {
                    setTimeout(() => {
                        this.socketService.removeUsuarioSinLeer(this.usuarioConectado.usuario);
                        this.changeDetectionRef.markForCheck();
                    }, 1000);
                }

                if (message.chat.id !== null) {
                    let usuarioEncontrado = false;

                    for (let i = 0; i < this.usuariosChat.length; i++) {
                        if (!usuarioEncontrado) {
                            if (
                                this.usuariosChat[i].usuarios.findIndex((usuario: IUsuario) => usuario.usuario === message.from.usuario) !==
                                -1
                            ) {
                                usuarioEncontrado = true;
                                this.usuariosChat[i].id = message.chat.id;
                                this.usuariosChat[i].status = message.chat.status;
                                // this.usuariosChat[i].usuarios = message.chat.usuarios;
                                this.usuariosChat[i].ultimaVezVisto = message.chat.ultimaVezVisto;
                                // this.usuariosChat[i].mensajes = message.chat.mensajes;
                            }
                        }

                        this.changeDetectionRef.markForCheck();
                    }

                    usuarioEncontrado = false;

                    this.chat.id = message.chat.id;
                    this.chat.status = message.chat.status;
                    // this.chat.usuarios = message.chat.usuarios;
                    this.chat.ultimaVezVisto = message.chat.ultimaVezVisto;
                    // this.chat.mensajes = message.chat.mensajes;

                    this.chatId = this.chat.id;
                    this.changeDetectionRef.markForCheck();
                }

                if (this.mensajes.length > 0) {
                    if (this.mensajes[this.mensajes.length - 1].from.usuario === this.usuarioConectado.usuario) {
                        message.from.profilePic = null;
                        this.mensajes.push(message);
                        this.changeDetectionRef.markForCheck();
                    } else {
                        this.mensajes.push(message);
                        this.changeDetectionRef.markForCheck();
                    }
                } else {
                    this.mensajes.push(message);
                    this.changeDetectionRef.markForCheck();
                }

                this.changeDetectionRef.markForCheck();
            } else if (message.from.usuario !== this.usuarioActual.usuario) {
                this.changeDetectionRef.markForCheck();
            }
        });
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

    minimizarPanel() {
        this.abierto = false;
        this.selectFlag = false;
        this.socketService.chatClosed(this.usuarioActual, this.usuarioConectado);

        // al minimizar panel se borran los mensajes
        this.mensajes.length = 0;
        this.mensajes = [];

        this.suscriptionConnectingMessage.unsubscribe();
        this.suscDesconexionMessage.unsubscribe();
        this.suscMensageMessage.unsubscribe();
        this.destruirChatSubscription.unsubscribe();
        this.actualChatIdSubscription.unsubscribe();

        this.changeDetectionRef.markForCheck();
        this.panelRef.dismiss();
    }

    sendMsg() {
        if (typeof this.msgInput !== 'undefined') {
            if (this.msgInput.length !== 0) {
                const chat: IChat = new Chat(this.chatId);

                // para evitar null pointer exception se ponen undefined los siguientes campos
                // para guardar el mensaje estos campos no son necesarios
                this.usuarioActual.chats = undefined;
                this.usuarioActual.actividads = undefined;

                const messageToSend: Message = new Message(
                    this.usuarioActual,
                    this.msgInput,
                    this.usuarioConectado.usuario,
                    moment(),
                    false,
                    false,
                    false,
                    true,
                    chat,
                    new Mensaje(null, this.msgInput, moment(), chat, this.usuarioActual)
                );

                this.mensajes.push(messageToSend);
                this.changeDetectionRef.detectChanges();
                this.socketService.sendMessage(messageToSend);
                this.msgInput = '';
                this.changeDetectionRef.markForCheck();
            }
        }
    }
}
