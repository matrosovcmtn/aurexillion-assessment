package com.aurexillion.tickets.controller;

import com.aurexillion.tickets.dto.StatusRequest;
import com.aurexillion.tickets.dto.StatusResponse;
import com.aurexillion.tickets.service.TicketStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/statuses")
@RequiredArgsConstructor
public class TicketStatusController {

    private final TicketStatusService ticketStatusService;

    @GetMapping
    public List<StatusResponse> list(@RequestParam(required = false) Boolean active) {
        return ticketStatusService.list(active).stream().map(StatusResponse::from).toList();
    }

    @GetMapping("/{id}")
    public StatusResponse get(@PathVariable Long id) {
        return StatusResponse.from(ticketStatusService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StatusResponse create(@Valid @RequestBody StatusRequest request) {
        return StatusResponse.from(ticketStatusService.create(request));
    }

    @PutMapping("/{id}")
    public StatusResponse update(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return StatusResponse.from(ticketStatusService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        ticketStatusService.delete(id);
    }
}
