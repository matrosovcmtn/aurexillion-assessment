package com.aurexillion.tickets.service;

import com.aurexillion.tickets.dto.CreateTicketRequest;
import com.aurexillion.tickets.dto.UpdateTicketRequest;
import com.aurexillion.tickets.error.BadRequestException;
import com.aurexillion.tickets.error.InvalidFilterException;
import com.aurexillion.tickets.error.TicketNotFoundException;
import com.aurexillion.tickets.model.Priority;
import com.aurexillion.tickets.model.Tag;
import com.aurexillion.tickets.model.Ticket;
import com.aurexillion.tickets.model.TicketStatus;
import com.aurexillion.tickets.repository.TicketRepository;
import com.aurexillion.tickets.repository.TicketSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TicketService {

    private static final Set<String> ALLOWED_SORTS = Set.of("createdAt", "deadline");

    private final TicketRepository ticketRepository;
    private final TicketStatusService ticketStatusService;
    private final TagService tagService;
    private final AssigneeService assigneeService;
    private final SettingsService settingsService;

    @Transactional(readOnly = true)
    public Page<Ticket> list(
            String q,
            Long statusId,
            String priorityParam,
            String tagIdsParam,
            String assigneeIdsParam,
            String code,
            int page,
            int size,
            String sortParam) {
        List<Priority> priorities = parsePriorities(priorityParam);
        List<Long> tagIds = parseIds(tagIdsParam, "tagIds");
        List<Long> assigneeIds = parseIds(assigneeIdsParam, "assigneeIds");
        Pageable pageable = toPageable(page, size, sortParam);

        return ticketRepository.findAll(
                TicketSpecifications.withFilters(q, statusId, priorities, tagIds, assigneeIds, code),
                pageable);
    }

    @Transactional(readOnly = true)
    public Ticket get(Long id) {
        return ticketRepository.findById(id).orElseThrow(() -> new TicketNotFoundException(id));
    }

    @Transactional
    public Ticket create(CreateTicketRequest request) {
        TicketStatus status = ticketStatusService.requireInitial();

        Ticket ticket = new Ticket(
                settingsService.nextTicketCode(),
                request.title().trim(),
                request.description().trim(),
                request.customerName().trim(),
                request.customerEmail().trim(),
                status,
                request.priority());
        ticket.setDeadline(request.deadline());

        if (request.assigneeId() != null) {
            ticket.setAssignee(assigneeService.get(request.assigneeId()));
        }
        if (request.tagIds() != null) {
            ticket.setTags(tagService.requireAll(request.tagIds()));
        }

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket update(Long id, UpdateTicketRequest request) {
        if (!request.hasAnyChange()) {
            throw new BadRequestException("Patch body must include at least one field");
        }

        Ticket ticket = get(id);

        if (request.isStatusIdPresent()) {
            if (request.getStatusId() == null) {
                throw new BadRequestException("statusId must not be null");
            }
            TicketStatus next = ticketStatusService.get(request.getStatusId());
            if (!next.isActive() && !next.getId().equals(ticket.getStatus().getId())) {
                throw new BadRequestException("Status " + next.getId() + " is not active");
            }
            ticket.setStatus(next);
        }

        if (request.isPriorityPresent()) {
            if (request.getPriority() == null) {
                throw new BadRequestException("priority must not be null");
            }
            ticket.setPriority(request.getPriority());
        }

        if (request.isDeadlinePresent()) {
            ticket.setDeadline(request.getDeadline());
        }

        if (request.isAssigneeIdPresent()) {
            if (request.getAssigneeId() == null) {
                ticket.setAssignee(null);
            } else {
                ticket.setAssignee(assigneeService.get(request.getAssigneeId()));
            }
        }

        if (request.isTagIdsPresent()) {
            Set<Tag> tags = request.getTagIds() == null
                    ? Set.of()
                    : tagService.requireAll(request.getTagIds());
            ticket.setTags(new HashSet<>(tags));
        }

        return ticketRepository.save(ticket);
    }

    @Transactional
    public void delete(Long id) {
        Ticket ticket = get(id);
        ticketRepository.delete(ticket);
    }

    private Pageable toPageable(int page, int size, String sortParam) {
        int safePage = Math.max(page, 0);
        int safeSize = size < 1 ? 20 : Math.min(size, 100);

        if (sortParam == null || sortParam.isBlank()) {
            return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        String[] parts = sortParam.split(",", 2);
        String property = parts[0].trim();
        if (!ALLOWED_SORTS.contains(property)) {
            throw new InvalidFilterException("Invalid sort field: " + property);
        }

        Sort.Direction direction = Sort.Direction.ASC;
        if (parts.length > 1 && parts[1].trim().equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        } else if (parts.length > 1 && !parts[1].trim().equalsIgnoreCase("asc")) {
            throw new InvalidFilterException("Invalid sort direction: " + parts[1].trim());
        }

        Sort sort = Sort.by(direction, property);
        if ("deadline".equals(property)) {
            sort = sort.and(Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        return PageRequest.of(safePage, safeSize, sort);
    }

    private List<Priority> parsePriorities(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        try {
            return Arrays.stream(value.split(","))
                    .map(String::trim)
                    .filter(part -> !part.isEmpty())
                    .map(Priority::fromWireValue)
                    .toList();
        } catch (IllegalArgumentException ex) {
            throw new InvalidFilterException("Invalid priority filter: " + value);
        }
    }

    private List<Long> parseIds(String value, String paramName) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        try {
            return Arrays.stream(value.split(","))
                    .map(String::trim)
                    .filter(part -> !part.isEmpty())
                    .map(Long::valueOf)
                    .toList();
        } catch (NumberFormatException ex) {
            throw new InvalidFilterException("Invalid " + paramName + " filter: " + value);
        }
    }
}
