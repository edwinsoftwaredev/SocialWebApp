package com.dell.socialproject.web.rest;

import com.dell.socialproject.security.jwt.JWTFilter;
import com.dell.socialproject.security.jwt.TokenProvider;
import com.dell.socialproject.web.rest.vm.LoginVM;

import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

/**
 * Controller to authenticate users.
 */
@RestController
@RequestMapping("/api")
public class UserJWTController {

    private final TokenProvider tokenProvider;

    private final AuthenticationManager authenticationManager;

    public UserJWTController(TokenProvider tokenProvider, AuthenticationManager authenticationManager) {
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/authenticate")
    @Timed
    public ResponseEntity<JWTToken> authorize(@Valid @RequestBody LoginVM loginVM) {

        UsernamePasswordAuthenticationToken authenticationToken =
            new UsernamePasswordAuthenticationToken(loginVM.getUsername(), loginVM.getPassword());

        Authentication authentication = this.authenticationManager.authenticate(authenticationToken);

        /* En la linea this.authenticationManager.authenticate(authenticationToken);, authenticationToken
        ** tiene el usuario y el password proporcionados por el cliente!!!!.
        ** Cuando se ejecuta la linea this.authenticationManager.authenticate(authenticationToken); tambien
        ** se llama al metodo loadUserByUsername que implementa UserDetailsService de Spring Security.
        ** En el archivo de configuracion de seguridad, SecurityConfiguration.java, se injecta el bean
        ** userDetailService que se encuentra en la clase DomainUserDetailsService.java que es la clase que 
        ** implementa UserDetailService de Spring Security.
        ** El metodo sobreescrito loadUserByUsername de DomainUserDetailsService.java obtiene los 
        ** detalles del usuario(UserDetails de Spring), SOLAMENTE con el nombre de usuario enviado por el cliente
        ** definido por el authenticationToken de la primera linea mencionada en este comentario.
        ** Lo que contiene UserDetails es por ejemplo el usuario, password, si esta activo(enabled) y los roles.
        ** Los detalles del usuario devueltos por loadUserByUsername se compara con los enviados en la linea
        ** this.authenticationManager.authenticate(authenticationToken), recordar que el argumento authenticationToken
        ** tiene los datos proporcionados por el usuario y loadUserByUsername devueve los datos que se encuentran en
        ** la base de datos!!!!. Es asi como se verifica que el password es el correcto, o sea, que le 
        ** pertenece al usuario o no.
        */

        /**
         * Que pasa cuando las credenciales no son correctas ver:
         * https://docs.spring.io/spring-security/site/docs/4.2.7.RELEASE/apidocs/org/springframework/security/authentication/AuthenticationManager.html#authenticate-org.springframework.security.core.Authentication-
         * en resumen el request es rechazado devolviendo 401 unauthorized
         */

        SecurityContextHolder.getContext().setAuthentication(authentication);

        /* La linea anterior ingresa la full authentication al contexto security de spring o SpringSecurityContext
        ** esto para que los datos de la autenticacion se utilizados posteiormente
        */

        boolean rememberMe = (loginVM.isRememberMe() == null) ? false : loginVM.isRememberMe();
        String jwt = tokenProvider.createToken(authentication, rememberMe);
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(JWTFilter.AUTHORIZATION_HEADER, "Bearer " + jwt);
        return new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK);
    }

    /**
     * Object to return as body in JWT Authentication.
     */
    static class JWTToken {

        private String idToken;

        JWTToken(String idToken) {
            this.idToken = idToken;
        }

        @JsonProperty("id_token")
        String getIdToken() {
            return idToken;
        }

        void setIdToken(String idToken) {
            this.idToken = idToken;
        }
    }
}
