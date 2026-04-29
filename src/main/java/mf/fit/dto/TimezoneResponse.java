package mf.fit.dto;

public class TimezoneResponse {

    private String timeZone;
    private String date;
    private String time;
    private String dateTime;
    private String dayOfWeek;
    private Boolean dstActive;

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public Boolean getDstActive() {
        return dstActive;
    }

    public void setDstActive(Boolean dstActive) {
        this.dstActive = dstActive;
    }
}