import { Component, Injectable, OnInit, TemplateRef } from '@angular/core';

import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { SERVER_API_URL } from 'app/app.constants';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { IUsuario } from 'app/shared/model/usuario.model';
import { Moment } from 'moment';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { IChat } from 'app/shared/model/chat.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
    get actualChatIdObservable(): Observable<IMessage> {
        return this._actualChatIdObservable;
    }
    get solicitudesMessage(): IMessage[] {
        return this._solicitudesMessage;
    }

    get usuariosSinLeer(): string[] {
        return this._usuariosSinLeer;
    }
    get usuarioLeidoObservable(): Observable<string> {
        return this._usuarioLeidoObservable;
    }
    get usuariosSinLeerObservable(): Observable<string> {
        return this._usuariosSinLeerObservable;
    }
    get chatMessages(): IMessage[] {
        return this._chatMessages;
    }
    // https://medium.com/oril/spring-boot-websockets-angular-5-f2f4b1c14cee
    // las demas referencias se encuentran la configuracion de seguridad de spring para websocket -> WebSocketSecurityConfiguration.java

    stompClient: any;
    sessionId: String = null;
    private enviarMensajeConexionFlag = true;

    public snackBarSolRec: TemplateRef<any>;

    private connectingMessageSubject: Subject<IMessage> = new Subject<IMessage>();
    private _connectedMessages: IMessage[] = [];
    private _connectingMessage: Observable<IMessage> = this.connectingMessageSubject.asObservable();

    private solicitudMessageSubject: Subject<IMessage> = new Subject<IMessage>();
    private _solicitudesMessage: IMessage[] = [];
    private _solicitudMessage: Observable<IMessage> = this.solicitudMessageSubject.asObservable();

    private mensageMessageSubject: Subject<IMessage> = new Subject<IMessage>();
    private _chatMessages: IMessage[] = [];
    private _mensageMessage: Observable<IMessage> = this.mensageMessageSubject.asObservable();

    private desconexionMessageSubject: Subject<IMessage> = new Subject<IMessage>();
    private _desconexionMessage: Observable<IMessage> = this.desconexionMessageSubject.asObservable();

    private messageQueue: IMessage[] = [];
    private processingMessagesFlag = false;

    private usuariosSinLeerSubject: Subject<string> = new Subject<string>();
    private _usuariosSinLeerObservable: Observable<string> = this.usuariosSinLeerSubject.asObservable();
    private _usuariosSinLeer: string[] = [];

    private usuarioLeido: Subject<string> = new Subject<string>();
    private _usuarioLeidoObservable: Observable<string> = this.usuarioLeido.asObservable();

    private actualChatId: Subject<IMessage> = new Subject<IMessage>();
    private _actualChatIdObservable: Observable<IMessage> = this.actualChatId.asObservable();

    private usuarioActual: IUsuario;

    destruirChatSubject: Subject<string> = new Subject<string>();
    destruirChatObservable: Observable<string> = this.destruirChatSubject.asObservable();

    constructor(private localStorage: LocalStorageService, private sessionStorage: SessionStorageService, private snackBar: MatSnackBar) {}

    initializeWebSocketConnection() {
        if (this.sessionId === null) {
            // console.log('Esta es SERVER_API_URL: ' + SERVER_API_URL);

            const socket = new SockJS(SERVER_API_URL + '/room');

            this.stompClient = Stomp.over(socket);

            // HABILITAR SI ES NECESARIO VER LOG EN LA CONSOLA
            this.stompClient.debug = null;

            const that = this;

            const token = that.localStorage.retrieve('authenticationToken') || that.sessionStorage.retrieve('authenticationToken');

            if (this.sessionId === null) {
                this.stompClient.connect(
                    { Authorization: 'Bearer ' + token },
                    function(frame) {
                        if (typeof frame.headers['user-name'] === 'undefined') {
                            that.closeStompSocket(true);

                            // that.initializeWebSocketConnection();
                        } else {
                            if (typeof that.stompClient.ws !== 'undefined') {
                                let url: String = that.stompClient.ws._transport.url;
                                url = url.replace('ws://' + SERVER_API_URL + '/room/', ''); // localhost:9090 tiene que cambiar por una variable global
                                url = url.replace('ws://localhost:9090/room/', '');
                                url = url.replace('url', '');
                                url = url.replace('/websocket', '');
                                url = url.replace(/^[0-9]+\//, '');
                                that.sessionId = url;

                                setTimeout(() => {
                                    that.subscribeToSocket();
                                }, 2000);
                            }
                        }
                    },
                    function(frame) {
                        setTimeout(() => {
                            console.log('Problemas de conexion. Reconectando...');
                            that.sessionId = null;

                            const token1 =
                                that.localStorage.retrieve('authenticationToken') || that.sessionStorage.retrieve('authenticationToken');

                            if (token1 !== null && typeof token1 !== 'undefined') {
                                that.initializeWebSocketConnection();
                            }
                        }, 5000);
                        // console.log(frame);
                    }
                );
            }
        }
    }

    processQueue(): void {
        while (this.messageQueue.length !== 0 && this.processingMessagesFlag === false) {
            this.processingMessagesFlag = true;

            const message: IMessage = this.messageQueue.pop();

            if (message.connectingMessage) {
                const messageIndex = this._connectedMessages.findIndex(
                    (msgDisconnect: IMessage) => msgDisconnect.from.usuario === message.from.usuario
                );

                if (messageIndex !== -1) {
                    this._connectedMessages.splice(messageIndex, 1);
                }

                this._connectedMessages.push(message);

                this.connectingMessageSubject.next(message);
            } else if (message.solicitudMessage) {
                // solicitudPendiente -- Alguien me envio una solicitud
                // solicitudAceptada -- Alguien acepto mi solicitud
                // acepteSolicitud -- se enviaran dos mensajes uno de conexion y otro de solicitudAceptada esto desde el back end

                if (message.text === 'solicitudPendiente') {
                    this.solicitudMessageSubject.next(message);
                    this._solicitudesMessage.push(message);
                    this.snackBar.openFromComponent(SnackbarSocketServiceComponent, {
                        duration: 5000
                    });
                } else if (message.text === 'solicitudAceptada') {
                    this.solicitudMessageSubject.next(message);
                    this._solicitudesMessage.push(message);
                    this.snackBar.openFromComponent(SnackbarSocketServiceAceptadaComponent, {
                        duration: 5000
                    });
                }
            } else if (message.disconnectMessage) {
                const messageIndex = this._connectedMessages.findIndex(
                    (msgDisconnect: IMessage) => msgDisconnect.from.usuario === message.from.usuario
                );

                if (messageIndex !== -1) {
                    this._connectedMessages.splice(messageIndex, 1);
                }

                this.desconexionMessageSubject.next(message);
            } else if (message.messageMessage) {
                if (this._usuariosSinLeer.indexOf(message.from.usuario) !== -1) {
                    this._usuariosSinLeer.splice(this._usuariosSinLeer.indexOf(message.from.usuario), 1);
                }

                this._usuariosSinLeer.push(message.from.usuario);
                this.usuariosSinLeerSubject.next(message.from.usuario);

                this._chatMessages.push(message); // se inserta el mensaje del usuario conectado
                this.mensageMessageSubject.next(message);
            } else if (message.text === 'MENSAJE_TIENE_CHATID') {
                this.actualChatId.next(message);
            } else if (message.text.includes('DESTRUIR_CHAT_ID_')) {
                this.destruirChatSubject.next(message.text.split('DESTRUIR_CHAT_ID_')[1]);
            } else {
                // console.log('Null Message');
            }

            if (this.messageQueue.length === 0 && this.processingMessagesFlag === true) {
                this.processingMessagesFlag = false;
            }
        }
    }

    removeUsuarioSinLeer(usuario: string) {
        if (this._usuariosSinLeer.indexOf(usuario) !== -1) {
            this._usuariosSinLeer.splice(this._usuariosSinLeer.indexOf(usuario), 1);

            this.usuarioLeido.next(usuario);
        }
    }

    removeUsuarioSinLeerFromMensajes(usuario: string) {
        this._chatMessages = this._chatMessages.filter((message: IMessage) => message.from.usuario !== usuario);
        // console.log(this._chatMessages);
    }

    sendMessage(message: Message): void {
        if (this.sessionId !== null) {
            const token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');

            this.stompClient.send('/spring-security-socket/room/connect', { Authorization: 'Bearer ' + token }, JSON.stringify(message));

            const nuevoMensaje: IMessage = message;

            // this._chatMessages.push(nuevoMensaje); // se inserta el mensaje del usuario actual
        }
    }

    subscribeToSocket(): void {
        if (this.getSesionId() != null) {
            const token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');

            this.stompClient.subscribe(
                // '/user/queue/specific-user' + '-user' + this.getSesionId(),
                '/user/queue/specific-user', // se agrega como parte de los cambios para enviar mensajes a usuarios especificos
                (msg: any) => {
                    const message: IMessage = JSON.parse(msg.body);

                    this.messageQueue.unshift(message);

                    // console.log(this.messageQueue);

                    if (this.processingMessagesFlag === false) {
                        this.processQueue();
                    }
                },
                { Authorization: 'Bearer ' + token }
            );
        }
    }

    enviarMensajeConexion(): void {
        if (this.getSesionId() != null) {
            const token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');

            if (token != null) {
                this.stompClient.send('/spring-security-socket/room/connect', { Authorization: 'Bearer ' + token }, 'conectar');
                this.enviarMensajeConexionFlag = true;
            }
        }
    }

    /*enviarMensajeConexionSinToken(): void {
        this.stompClient.send('/spring-security-socket/room/connect', {}, 'conectar sin token');
    }*/

    chatClosed(usuarioActual: IUsuario, usuarioConectado: IUsuario) {
        // console.log(this._chatMessages);

        this._chatMessages = this._chatMessages.filter((message: IMessage) => {
            if (message.from.usuario === usuarioConectado.usuario && message.to === usuarioActual.usuario) {
                return false;
            } else {
                return true;
            }
        });

        // console.log(this._chatMessages);
    }

    closeStompSocket(force?: boolean) {
        this._connectedMessages.length = 0;
        this._connectedMessages = [];
        this._chatMessages.length = 0;
        this._chatMessages = [];

        if (this.sessionId != null) {
            const token = this.localStorage.retrieve('authenticationToken') || this.sessionStorage.retrieve('authenticationToken');

            const that = this;

            if (force) {
                this.stompClient.disconnect(
                    function() {
                        // console.log('socket cerrado forzado');
                        that.sessionId = null;
                        that.initializeWebSocketConnection();
                    },
                    { Authorization: 'Bearer ' + token }
                );
            } else {
                this.stompClient.disconnect(
                    function() {
                        // console.log('socket cerrado');
                    },
                    { Authorization: 'Bearer ' + token }
                );
            }

            this.sessionId = null;

            this.enviarMensajeConexionFlag = true;
        }
    }

    getSesionId(): String {
        return this.sessionId;
    }

    get connectedMessages(): IMessage[] {
        return this._connectedMessages;
    }

    get mensageMessage(): Observable<IMessage> {
        return this._mensageMessage;
    }
    get connectingMessage(): Observable<IMessage> {
        return this._connectingMessage;
    }

    get solicitudMessage(): Observable<IMessage> {
        return this._solicitudMessage;
    }

    get desconexionMessage(): Observable<IMessage> {
        return this._desconexionMessage;
    }
}

export interface IMessage {
    from?: IUsuario;
    text?: string;
    to?: string;
    dateTime?: Moment;
    connectingMessage?: boolean;
    solicitudMessage?: boolean;
    disconnectMessage?: boolean;
    messageMessage?: boolean;
    chat?: IChat;
    mensaje?: IMensaje;
}

export class Message implements IMessage {
    constructor(
        public from?: IUsuario,
        public text?: string,
        public to?: string,
        public dateTime?: Moment,
        public connectingMessage?: boolean,
        public solicitudMessage?: boolean,
        public disconnectMessage?: boolean,
        public messageMessage?: boolean,
        public chat?: IChat,
        public mensaje?: IMensaje
    ) {}
}

export interface IMensaje {
    id?: number;
    texto?: string;
    fechaCreacion?: Moment;
    chat?: IChat;
    usuario?: IUsuario;
}

export class Mensaje implements IMensaje {
    constructor(public id?: number, public texto?: string, public fechaCreacion?: Moment, public chat?: IChat, public usuario?: IUsuario) {}
}

@Component({
    selector: 'jhi-snackbar-socket-service',
    template:
        '<div><div style="float: left;">' +
        '<div mat-card-avatar style="background-size: cover; ' +
        'background-position-x: center; ' +
        'background-position-y: center; ' +
        'height: 40px; ' +
        'width: 40px;" ' +
        "[ngStyle]=\"{'background-image': 'url(' + picUrl + ')'}\"></div>" +
        '</div>' +
        '<div style="float: left; margin-left: 5px;">' +
        '<div>' +
        '<span style="line-height: 40px;">{{message.from.primerNombre}} {{message.from.primerApellido}} te envi&oacute; una solicitud</span>' +
        '</div>' +
        '</div></div>'
})
export class SnackbarSocketServiceComponent implements OnInit {
    message: IMessage;
    picUrl: string;

    constructor(private socketService: SocketService, private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.message = this.socketService.solicitudesMessage[this.socketService.solicitudesMessage.length - 1];
        this.picUrl = this.getSanitizedUrl(this.message.from.profilePic, this.message.from.profilePicContentType);
    }

    getSanitizedUrl(file: any, fileContentType: string) {
        if (file.toString().charAt(0) === 'd') {
            return this.sanitizer.sanitize(4, file);
        } else {
            return this.sanitizer.sanitize(4, 'data:' + fileContentType + ';base64,' + file);
        }
    }
}

@Component({
    selector: 'jhi-snackbar-socket-service-acepto',
    template:
        '<div><div style="float: left;">' +
        '<div mat-card-avatar style="background-size: cover; ' +
        'background-position-x: center; ' +
        'background-position-y: center; ' +
        'height: 40px; ' +
        'width: 40px;" ' +
        "[ngStyle]=\"{'background-image': 'url(' + picUrl + ')'}\"></div>" +
        '</div>' +
        '<div style="float: left; margin-left: 5px;">' +
        '<div>' +
        '<span style="line-height: 40px;">{{message.from.primerNombre}} {{message.from.primerApellido}} acepto tu solicitud</span>' +
        '</div>' +
        '</div></div>'
})
export class SnackbarSocketServiceAceptadaComponent implements OnInit {
    message: IMessage;
    picUrl: string;

    constructor(private socketService: SocketService, private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.message = this.socketService.solicitudesMessage[this.socketService.solicitudesMessage.length - 1];
        this.picUrl = this.getSanitizedUrl(this.message.from.profilePic, this.message.from.profilePicContentType);
    }

    getSanitizedUrl(file: any, fileContentType: string) {
        if (file.toString().charAt(0) === 'd') {
            return this.sanitizer.sanitize(4, file);
        } else {
            return this.sanitizer.sanitize(4, 'data:' + fileContentType + ';base64,' + file);
        }
    }
}
