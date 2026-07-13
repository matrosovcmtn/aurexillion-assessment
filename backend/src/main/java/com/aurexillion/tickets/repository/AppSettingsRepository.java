package com.aurexillion.tickets.repository;

import com.aurexillion.tickets.model.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {
}
