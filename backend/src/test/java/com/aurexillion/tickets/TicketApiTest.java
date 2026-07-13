package com.aurexillion.tickets;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class TicketApiTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createTicketWithoutTitleReturnsBadRequest() throws Exception {
        String body = """
                {
                  "description": "desc",
                  "customerName": "Jane Doe",
                  "customerEmail": "jane@example.com",
                  "priority": "high"
                }
                """;

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"));
    }

    @Test
    void createValidTicketPersistsWithInitialStatusAndCode() throws Exception {
        String body = """
                {
                  "title": "Cannot log in",
                  "description": "Login form rejects a valid password",
                  "customerName": "Jane Doe",
                  "customerEmail": "jane@example.com",
                  "priority": "high"
                }
                """;

        String response = mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status.name").value("Open"))
                .andExpect(jsonPath("$.status.isInitial").value(true))
                .andExpect(jsonPath("$.code").exists())
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/tickets/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status.name").value("Open"))
                .andExpect(jsonPath("$.title").value("Cannot log in"));
    }

    @Test
    void updateStatusPersistsAcrossFreshGet() throws Exception {
        String createBody = """
                {
                  "title": "Slow dashboard",
                  "description": "Dashboard takes 10s to load",
                  "customerName": "Marco Rossi",
                  "customerEmail": "marco@example.com",
                  "priority": "medium"
                }
                """;

        String createResponse = mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(createResponse).get("id").asLong();

        String statusesJson = mockMvc.perform(get("/api/statuses"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        long inProgressId = 0;
        for (JsonNode node : objectMapper.readTree(statusesJson)) {
            if ("In Progress".equals(node.get("name").asText())) {
                inProgressId = node.get("id").asLong();
                break;
            }
        }

        mockMvc.perform(patch("/api/tickets/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"statusId\":" + inProgressId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status.name").value("In Progress"));

        mockMvc.perform(get("/api/tickets/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status.name").value("In Progress"));
    }

    @Test
    void listReturnsPage() throws Exception {
        mockMvc.perform(get("/api/tickets").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists())
                .andExpect(jsonPath("$.size").value(5));
    }

    @Test
    void deleteTicketRemovesItAndReturns404OnGet() throws Exception {
        String createBody = """
                {
                  "title": "Created by mistake",
                  "description": "Should be deletable",
                  "customerName": "Jane Doe",
                  "customerEmail": "jane@example.com",
                  "priority": "low"
                }
                """;

        String createResponse = mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long id = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(delete("/api/tickets/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tickets/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteMissingTicketReturns404() throws Exception {
        mockMvc.perform(delete("/api/tickets/{id}", 999_999))
                .andExpect(status().isNotFound());
    }
}
