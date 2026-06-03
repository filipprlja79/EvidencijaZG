package mf.fit.dto;

public record DemoAccountResponse(
        String email,
        String password,
        String role,
        String label
) {
}
