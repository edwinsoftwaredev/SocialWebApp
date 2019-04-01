package com.dell.socialproject.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.Nullable;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import javax.servlet.http.HttpSession;
import javax.swing.plaf.basic.BasicInternalFrameTitlePane;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    final Logger log = LoggerFactory.getLogger(WebSocketConfiguration.class);

    public WebSocketConfiguration() {}

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue")
            .setTaskScheduler(heartBeatScheduler());
        registry.setApplicationDestinationPrefixes("/spring-security-socket");

        /*registry.enableSimpleBroker("/user/queue/specific-user")
                .setTaskScheduler(heartBeatScheduler());
        registry.setApplicationDestinationPrefixes("/spring-security-socket");
        registry.setUserDestinationPrefix("/user");*/
    }

    @Bean
    public TaskScheduler heartBeatScheduler() {
        return new ThreadPoolTaskScheduler();
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/room")
            .setAllowedOrigins("*");

        registry.addEndpoint("/room")
            .setAllowedOrigins("*")
            //.addInterceptors(httpHandshakeInterceptor())
            .withSockJS()
            .setSessionCookieNeeded(false);

        // .setAllowedOrigins() por default se toma solo solicitudes del mismo origen por lo que 
        // no configuramos esta opcion de momento.
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(204800);
    }
}
