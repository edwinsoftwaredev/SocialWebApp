package com.dell.socialproject.security.jwt;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * Filters incoming requests and installs a Spring Security principal if a header corresponding to a valid user is
 * found.
 */
public class JWTFilter extends GenericFilterBean {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    final Logger log = LoggerFactory.getLogger(JWTFilter.class);

    private TokenProvider tokenProvider;

    public JWTFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
        throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        String jwt = resolveToken(httpServletRequest); // -> aqui se quita el bearer del token en el encabezado que tiene el jwt
        if (StringUtils.hasText(jwt) && this.tokenProvider.validateToken(jwt)) {
            Authentication authentication = this.tokenProvider.getAuthentication(jwt);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        /*
        ** QUE PASA SI LA CONDICION ANTERIOR NO SE CUMPLE, POR EJEMPLO QUE EL TOKEN HAYA EXPIRADO? 
        ** VER LOS ULTIMOS PARRAFOS DEL SIGUIENTE LINK  PARRAFO 5.4.4 : 
        ** https://docs.spring.io/spring-security/site/docs/3.0.x/reference/technical-overview.html
        ** BASICAMENTE LO QUE INDICA EL LINK ANTERIOR ES QUE CUANDO SE TIENE sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        ** SUCEDE QUE SE HACE UN LIMPIADO AL SecurityContextHolder, QUE CONTIENE LOS SecurityContext,
        ** CUANDO !!!FINALIZA!!! EL REQUEST O LA SOLICITUD DEL LADO DEL SERVIDOR, ES DECIR,
        ** QUE EL USUARIO TENDRA QUE SER REAUTENTICADO EN CADA REQUEST O SOLICITUD.
        ** EN LAS LINEAS ANTERIORES SI NO SE CUMPLE LA CONDICION SUCEDE QUE EN EL MOMENTO NO HAY UN USUARIO AUTENTICADO
        ** POR LO QUE AL PASAR A LAS SIGUIENTE LINEA filterChain... SOLO TENDRA ACCESO A LOS RECURSOS QUE
        ** SON PUBLICOS O NO NECESITAN QUE HAY UN USUARIO AUTENTICADO
        */

        filterChain.doFilter(servletRequest, servletResponse);
    }

    private String resolveToken(HttpServletRequest request){
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
