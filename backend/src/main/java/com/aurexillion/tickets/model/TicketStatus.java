package com.aurexillion.tickets.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "statuses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TicketStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Setter
    private String name;

    @Column(nullable = false, length = 7)
    @Setter
    private String color;

    @Column(nullable = false)
    @Setter
    private int position;

    @Column(nullable = false)
    @Setter
    private boolean initial;

    @Column(nullable = false)
    @Setter
    private boolean active = true;

    public TicketStatus(String name, String color, int position, boolean initial) {
        this.name = name;
        this.color = color;
        this.position = position;
        this.initial = initial;
        this.active = true;
    }
}
