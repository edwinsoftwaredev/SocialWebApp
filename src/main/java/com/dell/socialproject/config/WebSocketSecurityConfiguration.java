package com.dell.socialproject.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.web.socket.WebSocketHandler;


@Configuration
public class WebSocketSecurityConfiguration extends AbstractSecurityWebSocketMessageBrokerConfig {

    final Logger log = LoggerFactory.getLogger(WebSocketSecurityConfiguration.class);

    /*POST IMPORTANTES PARA LOGRAR AUTENTICACION CON WEBSOCKET EN UNA APLICACION STATELESS*/

    // https://robertleggett.wordpress.com/2015/05/27/websockets-with-spring-spring-security/  ->> para lograr autenticacion por mensaje incluso en momento de conexion
    // https://github.com/Rob-Leggett/angular_websockets_security


    // https://stackoverflow.com/questions/48880207/if-resource-server-are-supposed-to-be-stateless-how-to-send-message-to-queue-wi ->> para lograr enviar mensaje a cada usuario
    // https://stackoverflow.com/questions/30887788/json-web-token-jwt-with-spring-based-sockjs-stomp-web-socket ->> para lograr autenticacion por mensaje
    // https://stackoverflow.com/questions/45405332/websocket-authentication-and-authorization-in-spring/45405333#45405333 ->> para entender como funciona websocket vs http con spring security
    // https://www.baeldung.com/spring-security-websockets ->> entender la seguridad con websocket


    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages.simpTypeMatchers(
                    SimpMessageType.MESSAGE,
                    SimpMessageType.CONNECT,
                    SimpMessageType.SUBSCRIBE).authenticated()
                .simpTypeMatchers(
                    SimpMessageType.UNSUBSCRIBE,
                    SimpMessageType.DISCONNECT,
                    SimpMessageType.HEARTBEAT).permitAll()
                .anyMessage().denyAll();
    }


}
