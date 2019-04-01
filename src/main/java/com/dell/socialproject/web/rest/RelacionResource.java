package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.config.FCMClient;
import com.dell.socialproject.config.MessageDTO;
import com.dell.socialproject.domain.Relacion;
import com.dell.socialproject.domain.Usuario;
import com.dell.socialproject.repository.RelacionRepository;
import com.dell.socialproject.repository.UsuarioRepository;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST controller for managing Relacion.
 */
@RestController
@RequestMapping("/api")
public class RelacionResource {

    private final Logger log = LoggerFactory.getLogger(RelacionResource.class);

    private static final String ENTITY_NAME = "relacion";

    private final RelacionRepository relacionRepository;

    private SimpUserRegistry userRegistry;
    private SimpMessagingTemplate messagingTemplate;
    private UsuarioRepository usuarioRepository;
    private FCMClient fcmClient;

    @Autowired
    public RelacionResource(RelacionRepository relacionRepository,
                            SimpMessagingTemplate messagingTemplate,
                            SimpUserRegistry userRegistry,
                            UsuarioRepository usuarioRepository,
                            FCMClient fcmClient) {
        this.relacionRepository = relacionRepository;
        this.userRegistry = userRegistry;
        this.messagingTemplate = messagingTemplate;
        this.usuarioRepository = usuarioRepository;
        this.fcmClient = fcmClient;
    }

    /**
     * POST  /relacions : Create a new relacion.
     *
     * @param relacion the relacion to create
     * @return the ResponseEntity with status 201 (Created) and with body the new relacion, or with status 400 (Bad Request) if the relacion has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/relacions")
    @Timed
    public ResponseEntity<Relacion> createRelacion(@RequestBody Relacion relacion) throws URISyntaxException {
        log.debug("REST request to save Relacion : {}", relacion);
        if (relacion.getId() != null) {
            throw new BadRequestAlertException("A new relacion cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // el "amigo" ya envio una solicitud -> se verifica con relacionToCheck 
        Optional<Relacion> relacionToCheck = this.relacionRepository.findByAmigoIdAndUsuario_Id(relacion.getUsuario().getId(), relacion.getAmigoId());
        Optional<Usuario> relacionUsuario = this.usuarioRepository.findById(relacion.getUsuario().getId());


        if(relacionToCheck.isPresent()) {
            
            if(relacionToCheck.get().isEstado()) {
                return ResponseEntity
                    .badRequest()
                    .headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "relacionestadoistrue", "Los usuarios ya son amigos"))
                    .body(null);
            } else {

                // aqui se agregara el ultimo registro de los dos que son a la relacion con sus estados = true.

                relacionToCheck.get().estado(true);
                this.relacionRepository.save(relacionToCheck.get()); // se cambia el estado de uno de los registro de la relacion

                relacion.estado(true);
                Relacion relacionEnviadaCliente = this.relacionRepository.save(relacion); // ojo que aqui relacion solo contiene del usuario el id del mismo

                if(this.userRegistry.getUser(relacionToCheck.get().getUsuario().getUsuario()) != null) {

                    if(relacionUsuario.isPresent()) {
                        // se envia mensaje que acepto solicitud del usuario que hizo la solicitud

                        // /user/queue/specific-user
                        this.messagingTemplate.convertAndSendToUser(relacionToCheck.get().getUsuario().getUsuario(),
                            "/queue/specific-user",
                            new MessageDTO(relacionUsuario.get(),
                                "solicitudAceptada",
                                relacionToCheck.get().getUsuario().getUsuario(),
                                LocalDateTime.now(),
                                false,
                                true,
                                false,
                                false,
                                null,
                             null));
                    }

                    if(relacionUsuario.isPresent()) {
                        // se envia mensaje de conexion al usuario que hizo la solicitud
                        this.messagingTemplate.convertAndSendToUser(relacionToCheck.get().getUsuario().getUsuario(),
                            "/queue/specific-user",
                            new MessageDTO(relacionUsuario.get(),"", relacionToCheck.get().getUsuario().getUsuario(), LocalDateTime.now(),true, false, false, false, null, null));

                        // se envia mensaje de conexion al usuario que acepto la solicitud
                        this.messagingTemplate.convertAndSendToUser(relacionUsuario.get().getUsuario(),
                            "/queue/specific-user",
                            new MessageDTO(relacionToCheck.get().getUsuario(),"", relacionUsuario.get().getUsuario(), LocalDateTime.now(),true, false, false, false, null, null));
                    }
                }

                // se envia notificacion de solicitud aceptada
                if(relacionUsuario.isPresent()) {
                    this.fcmClient.sendNotification(
                        new MessageDTO(relacionUsuario.get(),
                            "Aceptó tu solicitud de amistad",
                            relacionToCheck.get().getUsuario().getUsuario(),
                            LocalDateTime.now(),
                            false,
                            true,
                            false,
                            false,
                            null,
                            null)
                    );
                }

                return ResponseEntity.created(new URI("/api/relacions/" + relacionEnviadaCliente.getId()))
                    .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, relacionEnviadaCliente.getId().toString()))
                    .body(relacionEnviadaCliente);
            }

        } else {
            relacion.estado(false);

            Relacion relacionEnviadaCliente = this.relacionRepository.save(relacion);

            Optional<Usuario> usuarioEnviaSolicitud = this.usuarioRepository.findById(relacion.getUsuario().getId());
            Optional<Usuario> usuarioSolicitudEnviada = this.usuarioRepository.findById(relacion.getAmigoId());

            if(usuarioEnviaSolicitud.isPresent() && usuarioSolicitudEnviada.isPresent()) {
                if(userRegistry.getUser(usuarioSolicitudEnviada.get().getUsuario()) != null) {
                    // /user/queue/specific-user
                    this.messagingTemplate.convertAndSendToUser(usuarioSolicitudEnviada.get().getUsuario(),
                        "/queue/specific-user",
                        new MessageDTO(usuarioEnviaSolicitud.get(),
                            "solicitudPendiente",
                            usuarioSolicitudEnviada.get().getUsuario(),
                            LocalDateTime.now(),
                            false,
                            true,
                            false,
                            false,
                            null,
                            null));
                }

                // se envia notificacion de solicitud
                this.fcmClient.sendNotification(
                    new MessageDTO(usuarioEnviaSolicitud.get(),
                        "Te envió una solicitud de amistad",
                        usuarioSolicitudEnviada.get().getUsuario(),
                        LocalDateTime.now(),
                        false,
                        true,
                        false,
                        false,
                        null,
                        null)
                );
            }

            return ResponseEntity.created(new URI("/api/relacions/" + relacionEnviadaCliente.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, relacionEnviadaCliente.getId().toString()))
                .body(relacionEnviadaCliente);

        }
    }

    /**
     * PUT  /relacions : Updates an existing relacion.
     *
     * @param relacion the relacion to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated relacion,
     * or with status 400 (Bad Request) if the relacion is not valid,
     * or with status 500 (Internal Server Error) if the relacion couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/relacions")
    @Timed
    public ResponseEntity<Relacion> updateRelacion(@RequestBody Relacion relacion) throws URISyntaxException {
        log.debug("REST request to update Relacion : {}", relacion);
        if (relacion.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Relacion result = relacionRepository.save(relacion);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, relacion.getId().toString()))
            .body(result);
    }

    /**
     * GET  /relacions : get all the relacions.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of relacions in body
     */
    @GetMapping("/relacions")
    @Timed
    public List<Relacion> getAllRelacions() {
        log.debug("REST request to get all Relacions");
        return relacionRepository.findAll();
    }

    /**
     * GET  /relacions/:id : get the "id" relacion.
     *
     * @param id the id of the relacion to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the relacion, or with status 404 (Not Found)
     */
    @GetMapping("/relacions/{id}")
    @Timed
    public ResponseEntity<Relacion> getRelacion(@PathVariable Long id) {
        log.debug("REST request to get Relacion : {}", id);
        Optional<Relacion> relacion = relacionRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(relacion);
    }

    @GetMapping("/relacions/muro/{usuario}")
    @Timed
    public List<Relacion> getAllRelacionsByUsuario(@PathVariable String usuario) {
        log.debug("REST request to get Relacions : {}", usuario);
        return this.relacionRepository.findAllByUsuario_Usuario(usuario);
    }

    @GetMapping(value="/relacions/muro/socitudeRecibidas", params={"usuarioId"})
    @Timed
    public List<Relacion> getSolicitudesRecibidasByUsuario(@RequestParam("usuarioId") Long usuarioId) {
        log.debug("REST request to get all friend request received");
        return this.relacionRepository.findAllByAmigoId(usuarioId);
    }

    @GetMapping(value = "/relacions/muro/solicitudesEnviadas", params={"usuarioId"})
    @Timed
    public List<Usuario> getSolicitudesEnviadas(@RequestParam("usuarioId") Long usuarioId) {
        log.debug("REST request for get all friend request sent");

        final List<Long> listadoSolicitudesEnviadasId = this.relacionRepository.findAllByUsuario_Id(usuarioId)
            .stream()
            .filter(relacion -> !relacion.isEstado() && relacion.getAmigoId() != usuarioId)
            .map(relacion -> {
                return relacion.getAmigoId();
            })
            .collect(Collectors.toList());

        List<Usuario> listadoUSuarioSolicitudes = new ArrayList<Usuario>();

        if(listadoSolicitudesEnviadasId.size() != 0) {
            listadoUSuarioSolicitudes = this.usuarioRepository.findAllByUsuarioIdList(listadoSolicitudesEnviadasId);
        }

        return listadoUSuarioSolicitudes;

    }

    /**
     * DELETE  /relacions/:id : delete the "id" relacion.
     *
     * @param id the id of the relacion to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/relacions/{id}")
    @Timed
    public ResponseEntity<Void> deleteRelacion(@PathVariable Long id) {
        log.debug("REST request to delete Relacion : {}", id);

        relacionRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }

    @DeleteMapping(value = "/relacions/delete/solicitudenviada", params = {"usuarioId", "amigoId"})
    @Timed
    public ResponseEntity<Void> deleteSolicitudEnviada(@RequestParam("usuarioId") Long usuarioId, @RequestParam("amigoId") Long amigoId) {
        // usuarioId es quien envia la solicitud y el usuario actual
        // amigoID es quien recibe la solicitud
        relacionRepository.deleteByUsuario_IdAndAmigoId(usuarioId, amigoId);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "deleteSolicitudEnviada")).build();
    }

    @DeleteMapping(value = "/relacions/delete/solicitudrecibida", params = {"amigoId", "usuarioId"})
    @Timed
    public ResponseEntity<Void> deleteSolicitudRecibida(@RequestParam("amigoId") Long amigoId, @RequestParam("usuarioId") Long usuarioId) {
        // amigoId es de quien envia la solicitud
        // usuarioId es el usuario actual
        relacionRepository.deleteByUsuario_IdAndAmigoId(amigoId, usuarioId);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "deleteSolicitudRecibida")).build();
    }

    @DeleteMapping(value = "/relacions/delete/amigo", params = {"usuarioAmigoId", "usuarioId"})
    @Timed
    public ResponseEntity<Void> deleteAmigo(@RequestParam("usuarioAmigoId") Long usuarioAmigoId, @RequestParam("usuarioId") Long usuarioId) {
        // Primero se elimina la solictud que envie
        relacionRepository.deleteByUsuario_IdAndAmigoId(usuarioId, usuarioAmigoId);

        relacionRepository.deleteByUsuario_IdAndAmigoId(usuarioAmigoId, usuarioId);

        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, "deleteAmigo")).build();
    }
}
