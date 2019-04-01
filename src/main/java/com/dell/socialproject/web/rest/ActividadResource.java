package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.domain.Actividad;
import com.dell.socialproject.repository.ActividadRepository;
import com.dell.socialproject.web.rest.errors.BadRequestAlertException;
import com.dell.socialproject.web.rest.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing Actividad.
 */
@RestController
@RequestMapping("/api")
public class ActividadResource {

    private final Logger log = LoggerFactory.getLogger(ActividadResource.class);

    private static final String ENTITY_NAME = "actividad";

    private final ActividadRepository actividadRepository;

    public ActividadResource(ActividadRepository actividadRepository) {
        this.actividadRepository = actividadRepository;
    }

    /**
     * POST  /actividads : Create a new actividad.
     *
     * @param actividad the actividad to create
     * @return the ResponseEntity with status 201 (Created) and with body the new actividad, or with status 400 (Bad Request) if the actividad has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/actividads")
    @Timed
    public ResponseEntity<Actividad> createActividad(@RequestBody Actividad actividad) throws URISyntaxException {
        log.debug("REST request to save Actividad : {}", actividad);
        if (actividad.getId() != null) {
            throw new BadRequestAlertException("A new actividad cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Actividad result = actividadRepository.save(actividad);
        return ResponseEntity.created(new URI("/api/actividads/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /actividads : Updates an existing actividad.
     *
     * @param actividad the actividad to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated actividad,
     * or with status 400 (Bad Request) if the actividad is not valid,
     * or with status 500 (Internal Server Error) if the actividad couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/actividads")
    @Timed
    public ResponseEntity<Actividad> updateActividad(@RequestBody Actividad actividad) throws URISyntaxException {
        log.debug("REST request to update Actividad : {}", actividad);
        if (actividad.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Actividad result = actividadRepository.save(actividad);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, actividad.getId().toString()))
            .body(result);
    }

    /**
     * GET  /actividads : get all the actividads.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of actividads in body
     */
    @GetMapping("/actividads")
    @Timed
    public List<Actividad> getAllActividads() {
        log.debug("REST request to get all Actividads");
        return actividadRepository.findAll();
    }

    /**
     * GET  /actividads/:id : get the "id" actividad.
     *
     * @param id the id of the actividad to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the actividad, or with status 404 (Not Found)
     */
    @GetMapping("/actividads/{id}")
    @Timed
    public ResponseEntity<Actividad> getActividad(@PathVariable Long id) {
        log.debug("REST request to get Actividad : {}", id);
        Optional<Actividad> actividad = actividadRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(actividad);
    }

    /**
     * DELETE  /actividads/:id : delete the "id" actividad.
     *
     * @param id the id of the actividad to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/actividads/{id}")
    @Timed
    public ResponseEntity<Void> deleteActividad(@PathVariable Long id) {
        log.debug("REST request to delete Actividad : {}", id);

        actividadRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
