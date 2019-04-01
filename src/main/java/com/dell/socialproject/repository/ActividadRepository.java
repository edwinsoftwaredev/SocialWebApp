package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Actividad;
import com.dell.socialproject.domain.Usuario;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data  repository for the Actividad entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ActividadRepository extends JpaRepository<Actividad, Long> {

    @Transactional
    void deleteAllByUsuarios(@Param("usuario") Usuario usuario);

}
