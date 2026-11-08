package com.example.QuickApply;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.example.QuickApply.dto.AuthResponse;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class RestApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void protectedEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/profiles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUsersCanOnlyAccessTheirOwnProfiles() throws Exception {
        String firstPassword = "password-123";
        AuthResponse firstUser = register("first-" + UUID.randomUUID(), firstPassword);
        AuthResponse secondUser = register("second-" + UUID.randomUUID(), firstPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("username", firstUser.username(), "password", firstPassword))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"));

        MvcResult createResult = mockMvc.perform(post("/api/v1/profiles")
                        .header("Authorization", "Bearer " + firstUser.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 999,
                                  "profileName": "Software Developer",
                                  "firstName": "Ada",
                                  "lastName": "Lovelace",
                                  "fullName": "Ada Lovelace",
                                  "email": "ada@example.com",
                                  "currentTitle": {"fi": "Kehittäjä", "en": "Developer"},
                                  "willingToRelocate": false
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName").value("Ada Lovelace"))
                .andExpect(jsonPath("$.currentTitle.en").value("Developer"))
                .andReturn();

        long profileId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(get("/api/v1/profiles/{profileId}", profileId)
                        .header("Authorization", "Bearer " + firstUser.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileName").value("Software Developer"));

        mockMvc.perform(get("/api/v1/profiles/{profileId}", profileId)
                        .header("Authorization", "Bearer " + secondUser.token()))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/applications")
                        .header("Authorization", "Bearer " + firstUser.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "companyName": "Example Ltd",
                                  "jobTitle": "Java Developer",
                                  "status": "APPLIED",
                                  "appliedAt": "2026-10-23"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.companyName").value("Example Ltd"));
    }

    private AuthResponse register(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("username", username, "password", password))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
    }
}
