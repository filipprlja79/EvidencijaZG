package mf.fit.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import mf.fit.dto.TimezoneResponse;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "time-api")
public interface TimeApiClient {
    @GET
    @Path("/api/time/current/ip")
    TimezoneResponse getTimezoneByIp(@QueryParam("ipAddress") String ipAddress);
}
