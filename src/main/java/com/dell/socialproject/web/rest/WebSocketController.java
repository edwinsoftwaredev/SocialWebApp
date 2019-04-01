package com.dell.socialproject.web.rest;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.dell.socialproject.config.FCMClient;
import com.dell.socialproject.config.MessageDTO;
import com.dell.socialproject.domain.Chat;
import com.dell.socialproject.domain.Mensaje;
import com.dell.socialproject.domain.Relacion;
import com.dell.socialproject.domain.Usuario;
import com.dell.socialproject.repository.ChatRepository;
import com.dell.socialproject.repository.MensajeRepository;
import com.dell.socialproject.repository.RelacionRepository;
import com.dell.socialproject.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private ChatRepository chatRepository;
    private MensajeRepository mensajeRepository;
    private UsuarioRepository usuarioRepository;
    private FCMClient fcmClient;
    private RelacionRepository relacionRepository;

    final Logger log = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    public WebSocketController(SimpMessagingTemplate simpMessagingTemplate,
                               ChatRepository chatRepository,
                               MensajeRepository mensajeRepository,
                               UsuarioRepository usuarioRepository,
                               FCMClient fcmClient,
                               RelacionRepository relacionRepository) {
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.usuarioRepository = usuarioRepository;
        this.chatRepository = chatRepository;
        this.mensajeRepository = mensajeRepository;
        this.fcmClient = fcmClient;
        this.relacionRepository = relacionRepository;
    }

    @MessageMapping("/room/connect")
    public void sendConnectivity(
        @Payload MessageDTO message,
        Principal user,
        @Header("simpSessionId") String sessionId
    ) throws Exception {

        this.log.debug("SEND " + message.getTo());

        // del lado del cliente en el primer mensaje que se envia se tiene que tomar el chat id para el otro usuario
        // para que despues lo este enviando constantemente con el mensaje

        if(message.getChat().getId() != null) {

            // guardar mensaje

            // Revisar formas de mejorar el rendimiento !!!!!!!!!!!!!!!!!!!!!!!!!!!!

            // se busca donde el amigo se el usuario que envia el mensaje
            // y el usuario es quien recibe el mensaje
            Optional<Relacion> relacion =
                this.relacionRepository.findAllByUsuario_UsuarioAndAmigoId(message.getTo(), message.getFrom().getId());

            if (relacion.isPresent()) {
                if (relacion.get().isEstado()) {
                    Mensaje mensaje = message.getMensaje();

                    this.mensajeRepository.save(mensaje);

                    this.simpMessagingTemplate.convertAndSendToUser(
                        message.getTo(),
                        "/queue/specific-user",
                        message
                    );

                    this.fcmClient.sendNotification(message);
                }
            }

        } else {

            Optional<Usuario> usuarioDest = this.usuarioRepository.findByUsuarioWithChats(message.getTo());
            Optional<Usuario> usuarioFrom = this.usuarioRepository.findByUsuarioWithChats(message.getFrom().getUsuario());

            if (usuarioDest.isPresent() && usuarioFrom.isPresent()) {
                Optional<Relacion> relacion =
                    this.relacionRepository.findAllByUsuario_UsuarioAndAmigoId(usuarioDest.get().getUsuario(), usuarioFrom.get().getId());

                if (relacion.isPresent()) {
                    if (relacion.get().isEstado()) {

                        Set<Usuario> usuariosEnChat = new HashSet<>();

                        if(usuarioDest.isPresent()) {
                            usuariosEnChat.add(usuarioFrom.get());
                            usuariosEnChat.add(usuarioDest.get());

                            // creamos el chat

                            Chat chat = message.getChat();
                            chat.setFechaCreacion(LocalDateTime.now());
                            chat.setUsuarios(usuariosEnChat);

                            Chat resultChat = this.chatRepository.save(chat);

                            // crear registro en usuario_chat

                            usuarioFrom.get().addChat(resultChat);
                            usuarioDest.get().addChat(resultChat);

                            this.usuarioRepository.save(usuarioFrom.get());
                            this.usuarioRepository.save(usuarioDest.get());

                            // guardamos el primer mensaje

                            Mensaje mensaje = message.getMensaje();

                            mensaje.setChat(resultChat);

                            this.mensajeRepository.save(mensaje);

                            // agregamos chat id al mensaje enviado para el destinatario o el otro usuario

                            message.setChat(resultChat);

                            this.simpMessagingTemplate.convertAndSendToUser(
                                message.getTo(),
                                "/queue/specific-user",
                                message
                            );

                            this.fcmClient.sendNotification(message);

                            // creamos un mensaje para enviar al usuario emisor o primer usuario en enviar el mensaje el chat id

                            this.simpMessagingTemplate.convertAndSendToUser(message.getFrom().getUsuario(),
                                "/queue/specific-user",
                                new MessageDTO(message.getFrom(),
                                    "MENSAJE_TIENE_CHATID",
                                    message.getTo(),
                                    message.getDateTime(),
                                    false,
                                    false,
                                    false,
                                    false,
                                    resultChat,
                                    message.getMensaje()));
                        }

                    }
                }

            }
        }
    }
}
