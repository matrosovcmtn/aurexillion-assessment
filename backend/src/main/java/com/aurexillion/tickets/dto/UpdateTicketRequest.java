package com.aurexillion.tickets.dto;

import com.aurexillion.tickets.model.Priority;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

public class UpdateTicketRequest {

    private Long statusId;
    private Priority priority;
    private Instant deadline;
    private Long assigneeId;
    private List<Long> tagIds;

    private boolean statusIdPresent;
    private boolean priorityPresent;
    private boolean deadlinePresent;
    private boolean assigneeIdPresent;
    private boolean tagIdsPresent;

    public Long getStatusId() {
        return statusId;
    }

    @JsonProperty("statusId")
    public void setStatusId(Long statusId) {
        this.statusId = statusId;
        this.statusIdPresent = true;
    }

    public Priority getPriority() {
        return priority;
    }

    @JsonProperty("priority")
    public void setPriority(Priority priority) {
        this.priority = priority;
        this.priorityPresent = true;
    }

    public Instant getDeadline() {
        return deadline;
    }

    @JsonProperty("deadline")
    public void setDeadline(Instant deadline) {
        this.deadline = deadline;
        this.deadlinePresent = true;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    @JsonProperty("assigneeId")
    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
        this.assigneeIdPresent = true;
    }

    public List<Long> getTagIds() {
        return tagIds;
    }

    @JsonProperty("tagIds")
    public void setTagIds(List<Long> tagIds) {
        this.tagIds = tagIds;
        this.tagIdsPresent = true;
    }

    @JsonIgnore
    public boolean isStatusIdPresent() {
        return statusIdPresent;
    }

    @JsonIgnore
    public boolean isPriorityPresent() {
        return priorityPresent;
    }

    @JsonIgnore
    public boolean isDeadlinePresent() {
        return deadlinePresent;
    }

    @JsonIgnore
    public boolean isAssigneeIdPresent() {
        return assigneeIdPresent;
    }

    @JsonIgnore
    public boolean isTagIdsPresent() {
        return tagIdsPresent;
    }

    @JsonIgnore
    public boolean hasAnyChange() {
        return statusIdPresent || priorityPresent || deadlinePresent || assigneeIdPresent || tagIdsPresent;
    }
}
