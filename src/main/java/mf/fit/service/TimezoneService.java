package mf.fit.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import mf.fit.client.IpifyClient;
import mf.fit.client.TimeApiClient;
import mf.fit.dto.TimezoneResponse;
import mf.fit.entity.Stanar;
import mf.fit.entity.TimezoneInfo;
import mf.fit.repository.StanarRepository;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class TimezoneService {

    @Inject
    StanarRepository stanarRepository;

    @Inject
    @RestClient
    IpifyClient ipifyClient;

    @Inject
    @RestClient
    TimeApiClient timeApiClient;

    @Transactional
    public Stanar getTimezoneByIP(Long userId) {
        Stanar stanar = stanarRepository.findById(userId);

        if (stanar == null) {
            throw new RuntimeException("Stanar sa ID " + userId + " ne postoji");
        }

        String ipAddress = ipifyClient.getIpAddress();
        TimezoneResponse response = timeApiClient.getTimezoneByIp(ipAddress);

        TimezoneInfo timezoneInfo = new TimezoneInfo();
        timezoneInfo.setIpAddress(ipAddress);
        timezoneInfo.setTimeZone(response.getTimeZone());
        timezoneInfo.setDateTime(response.getDateTime());
        timezoneInfo.setDate(response.getDate());
        timezoneInfo.setTime(response.getTime());
        timezoneInfo.setDayOfWeek(response.getDayOfWeek());
        timezoneInfo.setDstActive(response.getDstActive());
        timezoneInfo.setStanar(stanar);

        stanar.getTimezoneInfos().add(timezoneInfo);

        return stanar;
    }
}
