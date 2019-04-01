package com.dell.socialproject.config;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.dell.socialproject.domain.Relacion;
import com.dell.socialproject.domain.Usuario;
import com.dell.socialproject.repository.RelacionRepository;
import com.dell.socialproject.repository.UsuarioRepository;
import com.dell.socialproject.security.SecurityUtils;
import com.dell.socialproject.web.rest.WebSocketController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

public class HttpHandshakeInterceptor implements HandshakeInterceptor {

    private final Logger log = LoggerFactory.getLogger(HttpHandshakeInterceptor.class);

    @Autowired
    SimpUserRegistry simpUserRegistry;
    
    @Autowired
    UsuarioRepository usuarioRepository;

    @Autowired
    RelacionRepository relacionRepository;

    @Autowired
    WebSocketController webSocketController;

    @Autowired
    SimpMessagingTemplate simpMessagingTemplate;

    private List<Usuario> listaAmigos;
    private List<Relacion> listaRelacionesCurrentUsuario;

    public HttpHandshakeInterceptor() { }

    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
    WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpSession session = servletRequest.getServletRequest().getSession();

            request.getHeaders().forEach((key, value) -> {
                this.log.debug("key: " + key.toString() + " value: " + value.toString());
            });

            this.log.debug("------------------------");
            
            response.getHeaders().forEach((key, value) -> {
                this.log.debug("key: " + key.toString() + " value: " + value.toString());
            });

            attributes.put("sessionId", session.getId());
        }
        return true;

    }   

    @Override
    public void afterHandshake(
            ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler,  Exception exception) {

        final String currentUserName = SecurityUtils.getCurrentUserLogin().get();

        request.getHeaders().forEach((key, value) -> {
            this.log.debug("key: " + key.toString() + " value: " + value.toString());
        });

        this.log.debug("------------------------");
        
        response.getHeaders().forEach((key, value) -> {
            this.log.debug("key: " + key.toString() + " value: " + value.toString());
        });

        this.log.debug("Upgrade Header value: " + response.getHeaders().getFirst("Upgrade"));
        this.log.debug("currentUserName: " + currentUserName);
        
        if (response.getHeaders().getFirst("Upgrade") == "WebSocket") {
            
            this.listaRelacionesCurrentUsuario = this.relacionRepository.findAllByUsuario_Usuario(currentUserName);
            this.listaRelacionesCurrentUsuario = this.listaRelacionesCurrentUsuario.stream()
                .filter(relacion -> relacion.isEstado())
                .collect(Collectors.toList());

            final List<Long> listaIdUsuarios = this.listaRelacionesCurrentUsuario.stream()
                .map(relacion -> {
                    return relacion.getAmigoId();
                }).collect(Collectors.toList());

            this.listaAmigos = this.usuarioRepository.findAllByUsuarioIdList(listaIdUsuarios);

            this.listaAmigos.stream()
                .filter(usuarioAmigo -> {
                    if(this.simpUserRegistry.getUser(usuarioAmigo.getUsuario()).hasSessions()) {
                        return true;
                    } else {
                        return false;
                    }
                })
                .map(usuarioAmigo -> {
                    this.simpMessagingTemplate.convertAndSendToUser(usuarioAmigo.getUsuario(), 
                        "/secured/user/queue/specific-user", 
                        new MessageDTO(currentUserName, "Me he conectado", usuarioAmigo.getUsuario(), true));
                    return usuarioAmigo;
                });
        }   
    }

    class MessageDTO {
        private String from;
        private String text;
        private String to;
        private boolean connectingMessage;

        public MessageDTO(String from, String text, String to, boolean connectingMessage) {
            this.from = from;
            this.text = text;
            this.to = to;
            this.connectingMessage = connectingMessage;
        }

        public boolean getConnectingMessage() {
            return this.connectingMessage;
        }

        public void setConnectingMessage(boolean connectingMessage) {
            this.connectingMessage = connectingMessage;
        }

        public String getTo() {
            return this.to;
        }

        public void setTo(String to) {
            this.to = to;
        }

        /**
         * @return the from
         */
        public String getFrom() {
            return from;
        }

        /**
         * @param from the from to set
         */
        public void setFrom(String from) {
            this.from = from;
        }

        /**
         * @return the text
         */
        public String getText() {
            return text;
        }

        /**
         * @param text the text to set
         */
        public void setText(String text) {
            this.text = text;
        }

        @Override
        public String toString() {
            return "[{from: "+this.getFrom()+", text: "+this.getText()+", to: "+this.getTo()+", connectingMessage: "+this.getConnectingMessage()+"}]";
        }
    }
} 
