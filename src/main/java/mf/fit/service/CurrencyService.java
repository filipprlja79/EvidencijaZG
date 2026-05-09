package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import mf.fit.client.CurrencyClient;
import mf.fit.dto.CurrencyResponse;
import mf.fit.entity.Stanar;
import mf.fit.repository.StanarRepository;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class CurrencyService {

    @Inject
    @RestClient
    CurrencyClient currencyClient;

    @Inject
    StanarRepository stanarRepository;

    public CurrencyResponse convert(String from, String to, double value) {
        CurrencyResponse response = currencyClient.getRate(from, to);
        response.setValue(value);
        response.setConvertedValue(value * response.getRate());
        return response;
    }

    @Transactional
    public CurrencyResponse convertAndSave(String from, String to, double value, Long userId) {
        Stanar stanar = stanarRepository.findById(userId);

        if (stanar == null) {
            throw new RuntimeException("Stanar sa ID: " + userId + " ne postoji");
        }

        CurrencyResponse response = convert(from, to, value);
        response.setStanar(stanar);
        double v = response.getRate() * value;
        response.setConvertedValue(v * response.getRate());
        stanar.getCurrencyResponses().add(response);

        return response;
    }
}
