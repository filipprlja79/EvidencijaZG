/*
 * Komentar projekta: REST klijent koji poziva spoljasnji servis i vraca podatke backend servisima.
 */

package mf.fit.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "ipify-api")
public interface IpifyClient {
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    String getIpAddress();
}

