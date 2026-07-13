package com.aurexillion.tickets.repository;

import com.aurexillion.tickets.model.Assignee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssigneeRepository extends JpaRepository<Assignee, Long> {

    List<Assignee> findAllByOrderByNameAsc();

    Optional<Assignee> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
}
