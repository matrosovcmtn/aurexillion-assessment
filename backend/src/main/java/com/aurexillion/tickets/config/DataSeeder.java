package com.aurexillion.tickets.config;

import com.aurexillion.tickets.model.AppSettings;
import com.aurexillion.tickets.model.Assignee;
import com.aurexillion.tickets.model.Priority;
import com.aurexillion.tickets.model.Tag;
import com.aurexillion.tickets.model.Ticket;
import com.aurexillion.tickets.model.TicketStatus;
import com.aurexillion.tickets.repository.AppSettingsRepository;
import com.aurexillion.tickets.repository.AssigneeRepository;
import com.aurexillion.tickets.repository.TagRepository;
import com.aurexillion.tickets.repository.TicketRepository;
import com.aurexillion.tickets.repository.TicketStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final int TICKET_COUNT = 100;

    private final TicketRepository ticketRepository;
    private final TicketStatusRepository ticketStatusRepository;
    private final TagRepository tagRepository;
    private final AssigneeRepository assigneeRepository;
    private final AppSettingsRepository appSettingsRepository;

    @Override
    @Transactional
    public void run(String... args) {
        AppSettings settings = appSettingsRepository.findById(1L).orElseGet(() -> {
            AppSettings created = new AppSettings();
            return appSettingsRepository.save(created);
        });

        List<TicketStatus> statuses = List.of(
                ensureStatus("Open", "#0ea5e9", 0, true),
                ensureStatus("Pending", "#94a3b8", 1, false),
                ensureStatus("In Progress", "#f59e0b", 2, false),
                ensureStatus("Waiting on Customer", "#a855f7", 3, false),
                ensureStatus("Escalated", "#ef4444", 4, false),
                ensureStatus("On Hold", "#64748b", 5, false),
                ensureStatus("Resolved", "#10b981", 6, false),
                ensureStatus("Closed", "#334155", 7, false)
        );

        List<Tag> tags = List.of(
                ensureTag("billing"),
                ensureTag("login"),
                ensureTag("account"),
                ensureTag("refund"),
                ensureTag("shipping"),
                ensureTag("bug"),
                ensureTag("feature"),
                ensureTag("onboarding"),
                ensureTag("security"),
                ensureTag("integration")
        );

        migrateAssignee(
                "anna.um@example.com",
                "Maya Chen",
                "maya.chen@example.com",
                "Customer Support",
                "Support Agent");
        migrateAssignee(
                "maxim.cheban@example.com",
                "Daniel Frost",
                "daniel.frost@example.com",
                "Customer Support",
                "Support Lead");

        List<Assignee> assignees = List.of(
                ensureAssignee("Maya Chen", "maya.chen@example.com", "Customer Support", "Support Agent"),
                ensureAssignee("Daniel Frost", "daniel.frost@example.com", "Customer Support", "Support Lead"),
                ensureAssignee("Sofia Park", "sofia.park@example.com", "Customer Support", "Billing Specialist"),
                ensureAssignee("Liam Ortega", "liam.ortega@example.com", "Customer Support", "Support Agent"),
                ensureAssignee("Nora Blake", "nora.blake@example.com", "Customer Success", "Success Manager"),
                ensureAssignee("Kai Nguyen", "kai.nguyen@example.com", "Technical Support", "Tier 2 Specialist"),
                ensureAssignee("Elena Rossi", "elena.rossi@example.com", "Customer Support", "Refund Specialist"),
                ensureAssignee("Omar Haddad", "omar.haddad@example.com", "Technical Support", "Integrations Specialist"),
                ensureAssignee("Priya Shah", "priya.shah@example.com", "Customer Support", "Onboarding Specialist"),
                ensureAssignee("Jonas Berg", "jonas.berg@example.com", "Security", "Trust & Safety")
        );

        if (ticketRepository.count() > 0) {
            return;
        }

        String[][] templates = {
                {"Unable to complete payment", "Customer receives an error after submitting the payment form on checkout."},
                {"Cannot reset password", "Reset link in the email leads to a 404 page. Customer is locked out of the account."},
                {"Refund for cancelled subscription", "Customer cancelled mid-cycle and asks for a prorated refund to the original card."},
                {"Invoice shows wrong tax amount", "VAT on the last invoice does not match the contract rate. Customer needs a corrected PDF."},
                {"Order still not delivered", "Tracking shows no movement for several days. Customer asks for status and possible reship."},
                {"Duplicate charge on renewal", "Charged twice for the same billing cycle. Customer wants one charge reversed."},
                {"Need to change account email", "Customer needs the login email updated; verification emails bounce to the old address."},
                {"Two-factor codes not arriving", "SMS codes never arrive on the registered phone number after several retries."},
                {"API webhook retries failing", "Partner integration reports repeated 500 responses from our webhook endpoint."},
                {"Onboarding checklist stuck", "New workspace cannot finish setup because the invite step never completes."},
                {"Suspicious login alert", "Customer reports unrecognized sign-in from another country and wants sessions revoked."},
                {"Feature request: export CSV", "Team wants bulk export of ticket history filtered by date range."},
                {"Shipping address update failed", "Checkout rejects a valid international address with a generic validation error."},
                {"SSO login loops forever", "Enterprise SSO redirects back to the login screen without creating a session."},
                {"Missing invoice PDF", "Customer cannot download last month's invoice from the billing portal."}
        };

        String[][] customers = {
                {"Jane Smith", "jane.smith@example.com"},
                {"Marco Rossi", "marco.rossi@example.com"},
                {"Aisha Khan", "aisha.khan@example.com"},
                {"Tom Becker", "tom.becker@example.com"},
                {"Lucia Fernandez", "lucia.fernandez@example.com"},
                {"Peter Novak", "peter.novak@example.com"},
                {"Grace Lee", "grace.lee@example.com"},
                {"Hassan Ali", "hassan.ali@example.com"},
                {"Chloe Martin", "chloe.martin@example.com"},
                {"Diego Alvarez", "diego.alvarez@example.com"},
                {"Yuki Tanaka", "yuki.tanaka@example.com"},
                {"Amelia Wright", "amelia.wright@example.com"}
        };

        Priority[] priorities = Priority.values();
        Instant now = Instant.now();
        long seq = settings.getNextTicketNumber();

        for (int i = 0; i < TICKET_COUNT; i++) {
            String[] template = templates[i % templates.length];
            String[] customer = customers[i % customers.length];
            TicketStatus status = statuses.get(i % statuses.size());
            Priority priority = priorities[i % priorities.length];

            Ticket ticket = ticket(
                    code(settings, seq++),
                    template[0] + (i >= templates.length ? " #" + (i + 1) : ""),
                    template[1],
                    customer[0],
                    customer[1],
                    status,
                    priority);

            if (i % 7 != 0) {
                ticket.setAssignee(assignees.get(i % assignees.size()));
            }

            ticket.setTags(pickTags(tags, i));
            ticket.setDeadline(deadlineFor(now, i));
            ticket.setCreatedAt(now.minus(i, ChronoUnit.HOURS).minus(i % 5, ChronoUnit.DAYS));
            ticketRepository.save(ticket);
        }

        settings.setNextTicketNumber(seq);
        appSettingsRepository.save(settings);
    }

    private static Set<Tag> pickTags(List<Tag> tags, int index) {
        if (index % 11 == 0) {
            return new HashSet<>();
        }
        List<Tag> selected = new ArrayList<>();
        selected.add(tags.get(index % tags.size()));
        if (index % 3 == 0) {
            selected.add(tags.get((index + 3) % tags.size()));
        }
        if (index % 5 == 0) {
            selected.add(tags.get((index + 7) % tags.size()));
        }
        return new HashSet<>(selected);
    }

    private static Instant deadlineFor(Instant now, int index) {
        return switch (index % 5) {
            case 0 -> null;
            case 1 -> now.minus(2 + (index % 10), ChronoUnit.DAYS);
            case 2 -> now.plus(1 + (index % 4), ChronoUnit.HOURS);
            case 3 -> now.plus(2 + (index % 14), ChronoUnit.DAYS);
            default -> now.plus(21 + (index % 30), ChronoUnit.DAYS);
        };
    }

    private void migrateAssignee(
            String oldEmail,
            String name,
            String newEmail,
            String department,
            String position) {
        assigneeRepository.findByEmailIgnoreCase(oldEmail).ifPresent(assignee -> {
            assignee.setName(name);
            assignee.setEmail(newEmail);
            assignee.setDepartment(department);
            assignee.setPosition(position);
            assigneeRepository.save(assignee);
        });
    }

    private TicketStatus ensureStatus(String name, String color, int position, boolean isInitial) {
        return ticketStatusRepository.findAllByOrderByPositionAsc().stream()
                .filter(status -> status.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> ticketStatusRepository.save(new TicketStatus(name, color, position, isInitial)));
    }

    private Tag ensureTag(String name) {
        return tagRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> tagRepository.save(new Tag(name)));
    }

    private Assignee ensureAssignee(String name, String email, String department, String position) {
        return assigneeRepository.findByEmailIgnoreCase(email)
                .map(existing -> {
                    existing.setName(name);
                    existing.setDepartment(department);
                    existing.setPosition(position);
                    return assigneeRepository.save(existing);
                })
                .orElseGet(() -> assigneeRepository.save(new Assignee(name, email, department, position)));
    }

    private static Ticket ticket(
            String code,
            String title,
            String description,
            String customerName,
            String customerEmail,
            TicketStatus status,
            Priority priority) {
        return new Ticket(code, title, description, customerName, customerEmail, status, priority);
    }

    private static String code(AppSettings settings, long number) {
        return settings.getTicketCodePrefix() + "-" + number;
    }
}
