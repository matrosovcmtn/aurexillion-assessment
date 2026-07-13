package com.aurexillion.tickets.controller;

import com.aurexillion.tickets.dto.CreateTicketRequest;
import com.aurexillion.tickets.dto.PageResponse;
import com.aurexillion.tickets.dto.TicketResponse;
import com.aurexillion.tickets.dto.UpdateTicketRequest;
import com.aurexillion.tickets.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public PageResponse<TicketResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String tagIds,
            @RequestParam(required = false) String assigneeIds,
            @RequestParam(required = false) String code,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        return PageResponse.from(
                ticketService
                        .list(q, statusId, priority, tagIds, assigneeIds, code, page, size, sort)
                        .map(TicketResponse::from));
    }

    @GetMapping("/{id}")
    public TicketResponse get(@PathVariable Long id) {
        return TicketResponse.from(ticketService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse create(@Valid @RequestBody CreateTicketRequest request) {
        return TicketResponse.from(ticketService.create(request));
    }

    @PatchMapping("/{id}")
    public TicketResponse update(@PathVariable Long id, @RequestBody UpdateTicketRequest request) {
        return TicketResponse.from(ticketService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        ticketService.delete(id);
    }
}
