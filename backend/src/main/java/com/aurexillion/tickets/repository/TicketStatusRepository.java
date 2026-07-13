package com.aurexillion.tickets.repository;

import com.aurexillion.tickets.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketStatusRepository extends JpaRepository<TicketStatus, Long> {

    List<TicketStatus> findAllByOrderByPositionAsc();

    List<TicketStatus> findByActiveTrueOrderByPositionAsc();

    Optional<TicketStatus> findByInitialTrue();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
