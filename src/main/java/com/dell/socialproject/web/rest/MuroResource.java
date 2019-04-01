package com.dell.socialproject.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.dell.socialproject.domain.Muro;
import com.dell.socialproject.repository.MuroRepository;
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
 * REST controller for managing Muro.
 */
@RestController
@RequestMapping("/api")
public class MuroResource {

    private final Logger log = LoggerFactory.getLogger(MuroResource.class);

    private static final String ENTITY_NAME = "muro";

    private final MuroRepository muroRepository;

    public MuroResource(MuroRepository muroRepository) {
        this.muroRepository = muroRepository;
    }

    /**
     * POST  /muros : Create a new muro.
     *
     * @param muro the muro to create
     * @return the ResponseEntity with status 201 (Created) and with body the new muro, or with status 400 (Bad Request) if the muro has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/muros")
    @Timed
    public ResponseEntity<Muro> createMuro(@RequestBody Muro muro) throws URISyntaxException {
        log.debug("REST request to save Muro : {}", muro);
        if (muro.getId() != null) {
            throw new BadRequestAlertException("A new muro cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Muro result = muroRepository.save(muro);
        return ResponseEntity.created(new URI("/api/muros/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /muros : Updates an existing muro.
     *
     * @param muro the muro to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated muro,
     * or with status 400 (Bad Request) if the muro is not valid,
     * or with status 500 (Internal Server Error) if the muro couldn't be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/muros")
    @Timed
    public ResponseEntity<Muro> updateMuro(@RequestBody Muro muro) throws URISyntaxException {
        log.debug("REST request to update Muro : {}", muro);
        if (muro.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Muro result = muroRepository.save(muro);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, muro.getId().toString()))
            .body(result);
    }

    /**
     * GET  /muros : get all the muros.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of muros in body
     */
    @GetMapping("/muros")
    @Timed
    public List<Muro> getAllMuros() {
        log.debug("REST request to get all Muros");
        return muroRepository.findAll();
    }

    /**
     * GET  /muros/:id : get the "id" muro.
     *
     * @param id the id of the muro to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the muro, or with status 404 (Not Found)
     */
    @GetMapping("/muros/{id}")
    @Timed
    public ResponseEntity<Muro> getMuro(@PathVariable Long id) {
        log.debug("REST request to get Muro : {}", id);
        Optional<Muro> muro = muroRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(muro);
    }

    /**
     * DELETE  /muros/:id : delete the "id" muro.
     *
     * @param id the id of the muro to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/muros/{id}")
    @Timed
    public ResponseEntity<Void> deleteMuro(@PathVariable Long id) {
        log.debug("REST request to delete Muro : {}", id);

        muroRepository.deleteById(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
}
