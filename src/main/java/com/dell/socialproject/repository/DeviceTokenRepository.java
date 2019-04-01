package com.dell.socialproject.repository;

import com.dell.socialproject.domain.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    List<DeviceToken> findAllByUsuario(@Param("usuario") String usuario);

    List<DeviceToken> findAllByToken(@Param("token") String token);

    @Transactional
    void deleteAllByTokenAndUsuario(@Param("token") String token, @Param("usuario") String usuario);

    @Transactional
    void deleteAllByUsuario(@Param("usuario") String usuario);

}
