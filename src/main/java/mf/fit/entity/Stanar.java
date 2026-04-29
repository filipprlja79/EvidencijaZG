package mf.fit.entity;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import mf.fit.dto.CurrencyResponse;

@Entity
public class Stanar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ime;
    private String prezime;
    private String brTelefona;
    private String username;
    private String password;
    private Boolean starjesina;

    @ManyToOne
    @JoinColumn(name = "stan_id")
    private Stan stan;

    @OneToMany(mappedBy = "stanar", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimezoneInfo> timezoneInfos = new ArrayList<>();

    @OneToMany(mappedBy = "stanar", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CurrencyResponse> currencyResponses = new ArrayList<>();

    // GETTERS & SETTERS
    public Long getId() { return id; }

    public String getIme() { return ime; }
    public void setIme(String ime) { this.ime = ime; }

    public String getPrezime() { return prezime; }
    public void setPrezime(String prezime) { this.prezime = prezime; }

    public Stan getStan() { return stan; }
    public void setStan(Stan stan) { this.stan = stan; }

    public String getBrTelefona(){return brTelefona;}
    public void setBrTelefona(String brTelefona){this.brTelefona = brTelefona;}

    public String getUsername(){return username;}
    public void setUsername(String username){this.username = username;}

    public String getPassword(){return password;}
    public void setPassword(String password){this.password = password;}

    public Boolean getStarjesina(){return starjesina;}
    public void setStarjesina(Boolean starjesina){this.starjesina = starjesina;}
    public List<TimezoneInfo> getTimezoneInfos() {
        return timezoneInfos;
    }

    public void setTimezoneInfos(List<TimezoneInfo> timezoneInfos) {
        this.timezoneInfos = timezoneInfos;
    }

    public List<CurrencyResponse> getCurrencyResponses() {
        return currencyResponses;
    }

    public void setCurrencyResponses(List<CurrencyResponse> currencyResponses) {
        this.currencyResponses = currencyResponses;
    }
}
