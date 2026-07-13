package com.aurexillion.tickets.controller;

import com.aurexillion.tickets.dto.AssigneeRequest;
import com.aurexillion.tickets.dto.AssigneeResponse;
import com.aurexillion.tickets.service.AssigneeService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assignees")
@RequiredArgsConstructor
public class AssigneeController {

    private final AssigneeService assigneeService;

    @GetMapping
    public List<AssigneeResponse> list() {
        return assigneeService.list().stream().map(AssigneeResponse::from).toList();
    }

    @GetMapping("/{id}")
    public AssigneeResponse get(@PathVariable Long id) {
        return AssigneeResponse.from(assigneeService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssigneeResponse create(@Valid @RequestBody AssigneeRequest request) {
        return AssigneeResponse.from(assigneeService.create(request));
    }

    @PutMapping("/{id}")
    public AssigneeResponse update(@PathVariable Long id, @Valid @RequestBody AssigneeRequest request) {
        return AssigneeResponse.from(assigneeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        assigneeService.delete(id);
    }
}
