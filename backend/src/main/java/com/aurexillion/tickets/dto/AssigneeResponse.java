package com.aurexillion.tickets.dto;

import com.aurexillion.tickets.model.Assignee;

public record AssigneeResponse(
        Long id,
        String name,
        String email,
        String department,
        String position
) {
    public static AssigneeResponse from(Assignee assignee) {
        return new AssigneeResponse(
                assignee.getId(),
                assignee.getName(),
                assignee.getEmail(),
                assignee.getDepartment(),
                assignee.getPosition());
    }
}
