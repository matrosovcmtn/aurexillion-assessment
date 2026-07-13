package com.aurexillion.tickets.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tickets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false)
    @Setter
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    @Setter
    private String description;

    @Column(nullable = false)
    @Setter
    private String customerName;

    @Column(nullable = false)
    @Setter
    private String customerEmail;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "status_id", nullable = false)
    @Setter
    private TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Setter
    private Priority priority;

    @Setter
    private Instant deadline;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    @Setter
    private Assignee assignee;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "ticket_tags",
            joinColumns = @JoinColumn(name = "ticket_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Setter
    private Set<Tag> tags = new HashSet<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    @Setter
    private Instant createdAt;

    public Ticket(
            String code,
            String title,
            String description,
            String customerName,
            String customerEmail,
            TicketStatus status,
            Priority priority) {
        this.code = code;
        this.title = title;
        this.description = description;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.status = status;
        this.priority = priority;
    }
}
