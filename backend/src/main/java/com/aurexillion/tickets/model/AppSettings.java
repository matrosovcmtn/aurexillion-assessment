package com.aurexillion.tickets.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "app_settings")
@Getter
@Setter
public class AppSettings {

    @Id
    private Long id = 1L;

    @Column(nullable = false, length = 16)
    private String ticketCodePrefix = "ut";

    @Column(nullable = false)
    private long nextTicketNumber = 1L;
}
