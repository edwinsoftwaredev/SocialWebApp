package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.config.MessageDTO;
import com.dell.socialproject.domain.Mensaje;
import com.dell.socialproject.repository.MensajeRepository;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Mensaje.
 */
@RestController
@RequestMapping("/api")
public class MensajeResource {

    private final Logger log = LoggerFactory.getLogger(MensajeResource.class);

    private static final String ENTITY_NAME = "mensaje";

    private final MensajeRepository mensajeRepository;

    public MensajeResource(MensajeRepository mensajeRepository) {
        this.mensajeRepository = mensajeRepository;
    }

    /**
     * POST  /mensajes : Create a new mensaje.
     *
     * @param mensaje the mensaje to create
     * @return the ResponseEntity with status 201 (Created) and with body the new mensaje, or with status 400 (Bad Request) if the mensaje has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/mensajes")
    @Timed
    public ResponseEntity<Mensaje> createMensaje(@RequestBody Mensaje mensaje) throws URISyntaxException {
        log.debug("REST request to save Mensaje : {}", mensaje);
        if (mensaje.getId() != null) {
            throw new BadRequestAlertException("A new mensaje cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Mensaje result = mensajeRepository.save(mensaje);
        return ResponseEntity.created(new URI("/api/mensajes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /mensajes : Updates an existing mensaje.
     *
     * @param mensaje the mensaje to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated mensaje,
     * or with status 400 (Bad Request) if the mensaje is not valid,
     * or with status 500 (Internal Server Error) if the mensaje couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/mensajes")
    @Timed
    public ResponseEntity<Mensaje> updateMensaje(@RequestBody Mensaje mensaje) throws URISyntaxException {
        log.debug("REST request to update Mensaje : {}", mensaje);
        if (mensaje.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Mensaje result = mensajeRepository.save(mensaje);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, mensaje.getId().toString()))
            .body(result);
    }

    /**
     * GET  /mensajes : get all the mensajes.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of mensajes in body
     */
    @GetMapping("/mensajes")
    @Timed
    public List<Mensaje> getAllMensajes() {
        log.debug("REST request to get all Mensajes");
        return mensajeRepository.findAll();
    }

    /**
     * GET  /mensajes/:id : get the "id" mensaje.
     *
     * @param id the id of the mensaje to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the mensaje, or with status 404 (Not Found)
     */
    @GetMapping("/mensajes/{id}")
    @Timed
    public ResponseEntity<Mensaje> getMensaje(@PathVariable Long id) {
        log.debug("REST request to get Mensaje : {}", id);
        Optional<Mensaje> mensaje = mensajeRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(mensaje);
    }

    @GetMapping(value = "/mensajes/mensajesGuardados", params = {"chatId", "paginaChat", "cantidadMensajes"})
    @Timed
    public List<Mensaje> getMensajesGuardados(@RequestParam("chatId") Long chatId,
                                              @RequestParam("paginaChat") int page,
                                              @RequestParam("cantidadMensajes") int size) {
        this.log.debug("REST request to get Mensajes guardados para chat: ", chatId);

        return this.mensajeRepository.findAllMensajesByChatId(chatId, PageRequest.of(page, size, Sort.Direction.DESC, "fechaCreacion"));
    }

    /**
     * DELETE  /mensajes/:id : delete the "id" mensaje.
     *
     * @param id the id of the mensaje to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/mensajes/{id}")
    @Timed
    public ResponseEntity<Void> deleteMensaje(@PathVariable Long id) {
        log.debug("REST request to delete Mensaje : {}", id);

        mensajeRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
