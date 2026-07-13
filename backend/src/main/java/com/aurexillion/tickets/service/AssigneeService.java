package com.aurexillion.tickets.service;

import com.aurexillion.tickets.dto.AssigneeRequest;
import com.aurexillion.tickets.error.BadRequestException;
import com.aurexillion.tickets.error.ConflictException;
import com.aurexillion.tickets.error.NotFoundException;
import com.aurexillion.tickets.model.Assignee;
import com.aurexillion.tickets.repository.AssigneeRepository;
import com.aurexillion.tickets.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssigneeService {

    private final AssigneeRepository assigneeRepository;
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<Assignee> list() {
        return assigneeRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Assignee get(Long id) {
        return assigneeRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Assignee " + id + " not found"));
    }

    @Transactional
    public Assignee create(AssigneeRequest request) {
        String email = request.email().trim();
        if (assigneeRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("Assignee email already exists");
        }
        String position = blankToNull(request.position());
        return assigneeRepository.save(new Assignee(
                request.name().trim(),
                email,
                request.department().trim(),
                position));
    }

    @Transactional
    public Assignee update(Long id, AssigneeRequest request) {
        Assignee assignee = get(id);
        String email = request.email().trim();
        if (assigneeRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new BadRequestException("Assignee email already exists");
        }
        assignee.setName(request.name().trim());
        assignee.setEmail(email);
        assignee.setDepartment(request.department().trim());
        assignee.setPosition(blankToNull(request.position()));
        return assigneeRepository.save(assignee);
    }

    @Transactional
    public void delete(Long id) {
        Assignee assignee = get(id);
        if (ticketRepository.countByAssigneeId(id) > 0) {
            throw new ConflictException("Assignee is in use by tickets");
        }
        assigneeRepository.delete(assignee);
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
