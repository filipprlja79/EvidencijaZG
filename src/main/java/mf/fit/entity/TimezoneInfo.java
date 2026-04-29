package mf.fit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class TimezoneInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ipAddress;
    private String timeZone;
    private String dateTime;
    private String date;
    private String time;
    private String dayOfWeek;
    private Boolean dstActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stanar_id")
    @JsonIgnore
    private Stanar stanar;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
    public String getDateTime() { return dateTime; }
    public void setDateTime(String dateTime) { this.dateTime = dateTime; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public Boolean getDstActive() { return dstActive; }
    public void setDstActive(Boolean dstActive) { this.dstActive = dstActive; }
    public Stanar getStanar() { return stanar; }
    public void setStanar(Stanar stanar) { this.stanar = stanar; }
}
