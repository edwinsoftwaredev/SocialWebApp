package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.domain.*;
import com.dell.socialproject.repository.*;
import com.dell.socialproject.service.UserService;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.checkerframework.checker.units.qual.Time;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Usuario.
 */
@RestController
@RequestMapping("/api")
public class UsuarioResource {

    private final Logger log = LoggerFactory.getLogger(UsuarioResource.class);

    private static final String ENTITY_NAME = "usuario";

    private final UsuarioRepository usuarioRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;
    private final RelacionRepository relacionRepository;

    private EntityManager entityManager;
    private UserService userService;

    public UsuarioResource(UsuarioRepository usuarioRepository,
                           DeviceTokenRepository deviceTokenRepository,
                           UserRepository userRepository,
                           RelacionRepository relacionRepository,
                           EntityManager entityManager,
                           UserService userService)
    {
        this.usuarioRepository = usuarioRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.userRepository = userRepository;
        this.relacionRepository = relacionRepository;
        this.entityManager = entityManager;
        this.userService = userService;
    }

    /**
     * POST  /usuarios : Create a new usuario.
     *
     * @param usuario the usuario to create
     * @return the ResponseEntity with status 201 (Created) and with body the new usuario, or with status 400 (Bad Request) if the usuario has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/usuarios")
    @Timed
    public ResponseEntity<Usuario> createUsuario(@RequestBody Usuario usuario) throws URISyntaxException {
        log.debug("REST request to save Usuario : {}", usuario);
        if (usuario.getId() != null) {
            throw new BadRequestAlertException("A new usuario cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Usuario result = usuarioRepository.save(usuario);
        return ResponseEntity.created(new URI("/api/usuarios/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /usuarios : Updates an existing usuario.
     *
     * @param usuario the usuario to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated usuario,
     * or with status 400 (Bad Request) if the usuario is not valid,
     * or with status 500 (Internal Server Error) if the usuario couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/usuarios")
    @Timed
    public ResponseEntity<Usuario> updateUsuario(@RequestBody Usuario usuario) throws URISyntaxException {
        log.debug("REST request to update Usuario : {}", usuario);
        if (usuario.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Usuario result = usuarioRepository.save(usuario);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, usuario.getId().toString()))
            .body(result);
    }

    /**
     * GET  /usuarios : get all the usuarios.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many)
     * @return the ResponseEntity with status 200 (OK) and the list of usuarios in body
     */
    @GetMapping("/usuarios")
    @Timed
    public List<Usuario> getAllUsuarios(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all Usuarios");
        return usuarioRepository.findAllWithEagerRelationships();
    }

    @GetMapping(value = "/usuarios/searching", params = {"searchString"})
    @Timed
    public List<Usuario> getAllUsuariosBySearchString(@RequestParam("searchString") String searchString) {
        log.debug("REST request to get all usuarios by search string");
        return usuarioRepository.findAllBySearchString(searchString);
    }

    /**
     * GET  /usuarios/:id : get the "id" usuario.
     *
     * @param id the id of the usuario to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the usuario, or with status 404 (Not Found)
     */
    @GetMapping("/usuarios/{id}")
    @Timed
    public ResponseEntity<Usuario> getUsuario(@PathVariable Long id) {
        log.debug("REST request to get Usuario : {}", id);
        Optional<Usuario> usuario = usuarioRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(usuario);
    }

    @GetMapping("/usuarios/muro/{usuario}")
    @Timed
    public ResponseEntity<Usuario> getUsuarioByUsuario(@PathVariable String usuario) {
        log.debug("REST request to get Usuario : {}", usuario);
        Optional<Usuario> usuarioGetted = usuarioRepository.findByUsuario(usuario);
        return ResponseUtil.wrapOrNotFound(usuarioGetted);
    }

    @GetMapping(value = "/usuarios/chats", params = {"usuarioId"})
    @Time
    public ResponseEntity<Usuario> getUsuarioChatByUsuarioId(@RequestParam("usuarioId") Long usuarioId) {

        log.debug("REST reques to get Usuario with chats");
        return ResponseUtil.wrapOrNotFound(this.usuarioRepository.findByUsuario_IdWithChats(usuarioId));

    }

    /**
     * DELETE  /usuarios/:id : delete the "id" usuario.
     *
     * @param id the id of the usuario to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/usuarios/{id}")
    @Timed
    @Transactional
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        log.debug("REST request to delete Usuario : {}", id);

        System.out.println("Entro a eliminar usuario");

        // obtener usuario Social
        Optional<Usuario> usuarioSocial = this.usuarioRepository.findById(id);
        if(usuarioSocial.isPresent()) {
            String usuario = usuarioSocial.get().getUsuario();

            // Obtener usuario JHIPSTER
            Optional<User> usuarioJhipster = this.userRepository.findOneByLogin(usuario);

            // Eliminar todos tokens de notificaciones del usuario
            this.deviceTokenRepository.deleteAllByUsuario(usuario);

            this.relacionRepository.deleteAllByAmigoId(usuarioSocial.get().getId());

            // eliminar usuario jhipster
            // esta linea es importante porque el usuario de jhipster es
            // guardado en la cache de spring. por lo que si se borra un usuario
            // y no se ejecuta esta linea el usuario de jhipster aun estara
            // accesible aun si ejecutamos:
            // this.userRepository.delete(usuarioJhipster.get());
            this.userService.deleteUser(usuarioJhipster.get().getLogin());

            // eliminar usuario de SOCIAL
            this.usuarioRepository.deleteById(id);

            Session session = this.entityManager.unwrap(Session.class);

            session.flush();

            session.evict(usuarioSocial.get());
            session.evict(usuarioJhipster.get());
        }
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    // Seccion REST device token
    @PostMapping("/devicetoken")
    @Timed
    public ResponseEntity<DeviceToken> createDeviceToken(@RequestBody DeviceToken deviceToken) throws URISyntaxException {
        log.debug("REST request to save Usuario : {}", deviceToken);
        if (deviceToken.getId() != null) {
            throw new BadRequestAlertException("A new deviceToken cannot already have an ID", "DeviceToken", "idexists");
        }
        DeviceToken result = deviceTokenRepository.save(deviceToken);
        return ResponseEntity.created(new URI("/api/devicetoken/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("DeviceToken", result.getId().toString()))
            .body(result);
    }

    @PutMapping("/devicetoken")
    @Timed
    public ResponseEntity<DeviceToken> updateDeviceToken(@RequestBody DeviceToken deviceToken) throws URISyntaxException {
        log.debug("REST request to update DeviceToken : {}", deviceToken);
        if (deviceToken.getId() == null) {
            throw new BadRequestAlertException("Invalid id", "DeviceToken", "idnull");
        }
        DeviceToken result = deviceTokenRepository.save(deviceToken);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("DeviceToken", deviceToken.getId().toString()))
            .body(result);
    }

    @GetMapping("/devicetoken/{usuario}")
    @Timed
    public List<DeviceToken> getDeviceToken(@PathVariable String usuario) {
        log.debug("REST request to get DeviceToken : {}", usuario);
        return deviceTokenRepository.findAllByUsuario(usuario);
    }

    @GetMapping("/devicetoken/finddevices/{token}")
    @Timed
    public List<DeviceToken> getDevicesToken(@PathVariable String token) {
        return deviceTokenRepository.findAllByToken(token);
    }

    @DeleteMapping(value = "/devicetoken", params = {"token", "usuario"})
    @Timed
    public ResponseEntity<Void> deleteDeviceToken(@RequestParam("token") String token,
                                                  @RequestParam("usuario") String usuario) {
        log.debug("REST request to delete DeviceToken : {}", token);

        deviceTokenRepository.deleteAllByTokenAndUsuario(token, usuario);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("DeviceToken", token.toString() + " and usuario: " + usuario.toString())).build();
    }
}
