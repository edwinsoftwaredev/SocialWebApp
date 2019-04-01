package com.dell.socialproject.repository;

import com.dell.socialproject.domain.Muro;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Muro entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MuroRepository extends JpaRepository<Muro, Long> {

}
