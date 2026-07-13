package com.aurexillion.tickets.service;

import com.aurexillion.tickets.dto.StatusRequest;
import com.aurexillion.tickets.error.BadRequestException;
import com.aurexillion.tickets.error.ConflictException;
import com.aurexillion.tickets.error.NotFoundException;
import com.aurexillion.tickets.model.TicketStatus;
import com.aurexillion.tickets.repository.TicketRepository;
import com.aurexillion.tickets.repository.TicketStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketStatusService {

    private final TicketStatusRepository ticketStatusRepository;
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public List<TicketStatus> list(Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ticketStatusRepository.findByActiveTrueOrderByPositionAsc();
        }
        return ticketStatusRepository.findAllByOrderByPositionAsc();
    }

    @Transactional(readOnly = true)
    public TicketStatus get(Long id) {
        return ticketStatusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Status " + id + " not found"));
    }

    @Transactional
    public TicketStatus create(StatusRequest request) {
        String name = request.name().trim();
        if (ticketStatusRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Status name already exists");
        }

        TicketStatus status = new TicketStatus(
                name,
                request.color().toLowerCase(),
                request.position(),
                request.isInitial());
        if (request.active() != null) {
            status.setActive(request.active());
        }
        status = ticketStatusRepository.save(status);
        if (status.isInitial()) {
            clearOtherInitial(status.getId());
        }
        return status;
    }

    @Transactional
    public TicketStatus update(Long id, StatusRequest request) {
        TicketStatus status = get(id);
        String name = request.name().trim();
        if (ticketStatusRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Status name already exists");
        }

        status.setName(name);
        status.setColor(request.color().toLowerCase());
        status.setPosition(request.position());
        status.setInitial(request.isInitial());
        if (request.active() != null) {
            status.setActive(request.active());
        }
        if (status.isInitial()) {
            clearOtherInitial(status.getId());
        } else if (ticketStatusRepository.findByInitialTrue().isEmpty()) {
            throw new BadRequestException("At least one status must be marked initial");
        }
        return ticketStatusRepository.save(status);
    }

    @Transactional
    public void delete(Long id) {
        TicketStatus status = get(id);
        if (ticketRepository.countByStatusId(id) > 0) {
            throw new ConflictException("Status is in use by tickets");
        }
        if (status.isInitial()) {
            throw new BadRequestException("Cannot delete the initial status");
        }
        ticketStatusRepository.delete(status);
    }

    @Transactional(readOnly = true)
    public TicketStatus requireInitial() {
        return ticketStatusRepository.findByInitialTrue()
                .orElseThrow(() -> new BadRequestException("No initial status configured"));
    }

    private void clearOtherInitial(Long keepId) {
        for (TicketStatus other : ticketStatusRepository.findAll()) {
            if (!other.getId().equals(keepId) && other.isInitial()) {
                other.setInitial(false);
                ticketStatusRepository.save(other);
            }
        }
    }
}
