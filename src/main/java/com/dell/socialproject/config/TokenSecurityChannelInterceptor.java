
package com.dell.socialproject.config;

import com.dell.socialproject.domain.Relacion;
import com.dell.socialproject.domain.Usuario;
import com.dell.socialproject.repository.RelacionRepository;
import com.dell.socialproject.repository.UsuarioRepository;
import com.dell.socialproject.security.jwt.TokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.user.DefaultUserDestinationResolver;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.messaging.simp.user.UserDestinationResolver;
import org.springframework.messaging.support.ExecutorChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.messaging.*;

import javax.annotation.Nullable;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class TokenSecurityChannelInterceptor implements ExecutorChannelInterceptor {

    final Logger log = LoggerFactory.getLogger(TokenSecurityChannelInterceptor.class);

    private DefaultSimpUserRegistry userRegistry = new DefaultSimpUserRegistry();
    private DefaultUserDestinationResolver resolver = new DefaultUserDestinationResolver(userRegistry);

    @Bean
    @Primary
    public SimpUserRegistry userRegistry() {
        return userRegistry;
    }

    @Bean
    @Primary
    public UserDestinationResolver userDestinationResolver() {
        return resolver;
    }

    @Autowired
    TokenProvider tokenProvider;

    @Autowired
    RelacionRepository relacionRepository;

    @Autowired
    UsuarioRepository usuarioRepository;

    private SimpMessagingTemplate simpMessagingTemplate;

    private final ThreadLocal<Stack<SecurityContext>> ORIGINAL_CONTEXT = new ThreadLocal<>();

    private final SecurityContext EMPTY_CONTEXT;
    private final Authentication anonymous;

    public TokenSecurityChannelInterceptor(@Lazy SimpMessagingTemplate simpMessagingTemplate) {
        this.EMPTY_CONTEXT = SecurityContextHolder.createEmptyContext();
        this.anonymous = new UsernamePasswordAuthenticationToken("anonymous", "");
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Nullable
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        this.setup(message);

        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // this.log.debug("PRE SEND " + stompHeaderAccessor.getCommand().toString());
        // this.log.debug("PRE SEND MESSAGE: " + message.getPayload().toString() + " HEADERS: " + message.getHeaders().toString());

        if(StompCommand.SEND.equals(stompHeaderAccessor.getCommand())) {

            try{
                // return MessageBuilder.createMessage(message.getPayload(), stompHeaderAccessor.getMessageHeaders());
                return message;
            } catch (AuthenticationException e) {
                log.debug(e.toString());
                return null;
            }

        } else if(StompCommand.DISCONNECT.equals(stompHeaderAccessor.getCommand())) {

            if(SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {

                // this.log.debug("ENTRO A DESCONEXION PARA ENVIO DE MENSAJE");

                final String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();

                if (this.usuarioRepository.findByUsuarioSinActividades(currentUserName).isPresent()) {
                    final Usuario usuarioSubscrito = this.usuarioRepository.findByUsuarioSinActividades(currentUserName).get();

                    List<Relacion> listaRelacionesCurrentUsuario = this.relacionRepository.findAllByUsuario_Usuario(currentUserName);
                    listaRelacionesCurrentUsuario = listaRelacionesCurrentUsuario.stream()
                        .filter(relacion -> relacion.isEstado())
                        .collect(Collectors.toList());

                    List<Long> listaIdUsuarios = listaRelacionesCurrentUsuario.stream()
                        .map(relacion -> relacion.getAmigoId())
                        .collect(Collectors.toList());

                    if(listaIdUsuarios.size() > 0) {

                        List<Usuario> listaAmigos = this.usuarioRepository.findAllByUsuarioIdList(listaIdUsuarios);

                        listaAmigos.stream()
                            .filter(usuarioAmigo -> userRegistry.getUser(usuarioAmigo.getUsuario()) != null)
                            .forEach(usuarioAmigo -> {

                                // usuario subscrito envia un mensaje de desconexion a todos sus amigos conectados
                            /*this.simpMessagingTemplate.convertAndSendToUser(usuarioAmigo.getUsuario(),
                                "/user/queue/specific-user",
                                new MessageDTO(usuarioSubscrito,"", usuarioAmigo.getUsuario(), LocalDateTime.now(),false, false, true, false, null, null));*/

                                this.simpMessagingTemplate.convertAndSendToUser(usuarioAmigo.getUsuario(),
                                    "/queue/specific-user",
                                    new MessageDTO(usuarioSubscrito,"", usuarioAmigo.getUsuario(), LocalDateTime.now(),false, false, true, false, null, null));

                            });

                    }
                } else {
                    System.out.println("no se encontro usuario para enviar mensaje");
                }

                // stompHeaderAccessor.setUser(SecurityContextHolder.getContext().getAuthentication());
                // userRegistry.onApplicationEvent(new SessionConnectedEvent(this, (Message<byte[]>) message, SecurityContextHolder.getContext().getAuthentication()));

            }

            return message;

        } else {
            return message;
        }
    }

    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        /* userRegistry.getUsers().forEach(simpUser -> {
            log.debug(simpUser.getName() + " tiene sesion: " + simpUser.hasSessions());
        }); */

        if(StompCommand.SUBSCRIBE.equals(stompHeaderAccessor.getCommand())) {
            final String currentUserName = SecurityContextHolder.getContext().getAuthentication().getName();
            final Usuario usuarioSubscrito = this.usuarioRepository.findByUsuarioSinActividades(currentUserName).get();

            List<Relacion> listaRelacionesCurrentUsuario = this.relacionRepository.findAllByUsuario_Usuario(currentUserName);
            listaRelacionesCurrentUsuario = listaRelacionesCurrentUsuario.stream()
                .filter(relacion -> relacion.isEstado())
                .collect(Collectors.toList());

            List<Long> listaIdUsuarios = listaRelacionesCurrentUsuario.stream()
                .map(relacion -> relacion.getAmigoId())
                .collect(Collectors.toList());


            if(listaIdUsuarios.size() > 0) {

                List<Usuario> listaAmigos = this.usuarioRepository.findAllByUsuarioIdList(listaIdUsuarios);

                listaAmigos.stream()
                    .filter(usuarioAmigo -> userRegistry.getUser(usuarioAmigo.getUsuario()) != null)
                    .forEach(usuarioAmigo -> {

                        // usuario subscrito recibe un mensaje de sus amigos conectados

                        /*this.simpMessagingTemplate.convertAndSendToUser(usuarioSubscrito.getUsuario(),
                            "/user/queue/specific-user",
                            new MessageDTO(usuarioAmigo,"", usuarioSubscrito.getUsuario(), LocalDateTime.now(),true, false, false, false, null, null));*/

                        this.simpMessagingTemplate.convertAndSendToUser(usuarioSubscrito.getUsuario(),
                            "/queue/specific-user",
                            new MessageDTO(usuarioAmigo,"", usuarioSubscrito.getUsuario(), LocalDateTime.now(),true, false, false, false, null, null));

                        // usuario subscrito envia un mensaje a todos sus amigos conectados

                        /*this.simpMessagingTemplate.convertAndSendToUser(usuarioAmigo.getUsuario(),
                            "/user/queue/specific-user",
                            new MessageDTO(usuarioSubscrito,"", usuarioAmigo.getUsuario(), LocalDateTime.now(),true, false, false, false, null, null));*/

                        this.simpMessagingTemplate.convertAndSendToUser(usuarioAmigo.getUsuario(),
                            "/queue/specific-user",
                            new MessageDTO(usuarioSubscrito,"", usuarioAmigo.getUsuario(), LocalDateTime.now(),true, false, false, false, null, null));
                    });

            }

           // stompHeaderAccessor.setUser(SecurityContextHolder.getContext().getAuthentication());
           // userRegistry.onApplicationEvent(new SessionConnectedEvent(this, (Message<byte[]>) message, SecurityContextHolder.getContext().getAuthentication()));
        }

        /* if(StompCommand.DISCONNECT.equals(stompHeaderAccessor.getCommand())) {
            //log.debug("header de Disconnect: ");
            //log.debug(stompHeaderAccessor.getMessageHeaders().toString());
        } */

        /*userRegistry.getUsers().forEach(simpUser -> {
            log.debug(""+simpUser.hasSessions());
        });*/

        this.cleanup();

        /*try {
            log.debug("Hay Contexto para HEARTBEAT: ");
            log.debug(SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (Exception e) {
            log.debug("No Contexto para comando: ");
            log.debug(e.toString());
        } */

    }

    /* @Override
    public Message<?> beforeHandle(Message<?> message, MessageChannel channel, MessageHandler handler) {
        this.setup(message);

        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        this.log.debug("before handle " + stompHeaderAccessor.getCommand().toString());
        this.log.debug("before handle: " + message.getHeaders().toString());

        if(StompCommand.SEND.equals(stompHeaderAccessor.getCommand())) {

            try {
                return message;
            } catch (AuthenticationException e) {
                log.debug(e.toString());
                return null;
            }

        } else {
            return message;
        }
    }

    @Override
    public void afterMessageHandled(Message<?> message, MessageChannel channel, MessageHandler handler, Exception ex) {
        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        this.log.debug("after handle " + stompHeaderAccessor.getCommand().toString());
        this.log.debug("after handle " + message.getHeaders().toString());


        if(StompCommand.DISCONNECT.equals(stompHeaderAccessor.getCommand())) {
            log.debug("header de Disconnect after handle: ");
            log.debug(stompHeaderAccessor.getMessageHeaders().toString());
        }
        this.cleanup();
        try {
            log.debug("Hay Contexto para comando after handle: " + stompHeaderAccessor.getCommand().toString());
            log.debug(SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (Exception e) {
            log.debug("No Contexto para comando after handle: " + stompHeaderAccessor.getCommand().toString());
            log.debug(e.toString());
        }
    } */

    private void setup(Message<?> message) {
        SecurityContext currentContext = SecurityContextHolder.getContext();
        Stack contextStack = (Stack) ORIGINAL_CONTEXT.get();
        if (contextStack == null) {
            contextStack = new Stack();
            ORIGINAL_CONTEXT.set(contextStack);
        }

        contextStack.push(currentContext);

        StompHeaderAccessor stompHeaderAccessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        List<String> tokenList = stompHeaderAccessor.getNativeHeader("Authorization");
        // stompHeaderAccessor.setLeaveMutable(true);

        // log.debug("luego de get native headers: " + message.getHeaders().toString());

        String token = null;
        Authentication usuarioAuthentication;

        if(tokenList != null && tokenList.size() > 0) {
            token = tokenList.get(0).replaceAll("Bearer", "").trim();
            if(tokenProvider.validateToken(token)){
                usuarioAuthentication = tokenProvider.getAuthentication(token);
                // SecurityContextHolder.getContext().setAuthentication(usuarioAuthentication);
            } else {
                usuarioAuthentication = this.anonymous;
            }
        } else {
            usuarioAuthentication = this.anonymous;
        }

        if(StompCommand.DISCONNECT.equals(stompHeaderAccessor.getCommand())) {
           usuarioAuthentication = (Authentication) stompHeaderAccessor.getHeader("simpUser");
        }

        // definiendo usuario en contexto para heartbeats
        if(stompHeaderAccessor.getHeader("simpMessageType").toString().equals("HEARTBEAT")) {
            if(stompHeaderAccessor.getHeader("simpUser") != null) {
                usuarioAuthentication = (Authentication) stompHeaderAccessor.getHeader("simpUser");
                // this.log.debug("ES HEARTBEAT: " + usuarioAuthentication.getName());
            }
        }

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(usuarioAuthentication);
        SecurityContextHolder.setContext(context);

        if(!StompCommand.DISCONNECT.equals(stompHeaderAccessor.getCommand()) && !StompCommand.UNSUBSCRIBE.equals(stompHeaderAccessor.getCommand())) {
            stompHeaderAccessor.setUser(usuarioAuthentication);

            if(StompCommand.CONNECT.equals(stompHeaderAccessor.getCommand())) {
                userRegistry.onApplicationEvent(new SessionConnectEvent(this, (Message<byte[]>) message, usuarioAuthentication));
            } else {
                userRegistry.onApplicationEvent(new SessionConnectedEvent(this, (Message<byte[]>) message, usuarioAuthentication));
            }

        } else if(StompCommand.UNSUBSCRIBE.equals(stompHeaderAccessor.getCommand())) {
            stompHeaderAccessor.setUser(usuarioAuthentication);
            userRegistry.onApplicationEvent(new SessionUnsubscribeEvent(this, (Message<byte[]>) message, usuarioAuthentication));
        } else if(StompCommand.DISCONNECT.equals(stompHeaderAccessor.getCommand())) {
            userRegistry.onApplicationEvent(new SessionDisconnectEvent(this, (Message<byte[]>) message, stompHeaderAccessor.getSessionId(), CloseStatus.NORMAL, usuarioAuthentication));
        }
    }

    private void cleanup() {
        Stack contextStack = (Stack) ORIGINAL_CONTEXT.get();
        if (contextStack != null && !contextStack.isEmpty()) {
            SecurityContext originalContext = (SecurityContext) contextStack.pop();

            try {
                if (this.EMPTY_CONTEXT.equals(originalContext)) {
                    SecurityContextHolder.clearContext();
                    ORIGINAL_CONTEXT.remove();
                } else {
                    SecurityContextHolder.setContext(originalContext);
                }
            } catch (Throwable var4) {
                SecurityContextHolder.clearContext();
            }

        } else {
            SecurityContextHolder.clearContext();
            ORIGINAL_CONTEXT.remove();
        }
    }
}
