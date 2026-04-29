package mf.fit.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import mf.fit.dto.CurrencyResponse;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "currency-api")
public interface CurrencyClient {

    @GET
    @Path("/api/rates")
    CurrencyResponse getRate(@QueryParam("from") String from, @QueryParam("to") String to);
}
