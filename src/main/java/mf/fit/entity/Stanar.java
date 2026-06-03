/*
 * Komentar projekta: JPA entitet koji predstavlja tabelu u bazi i opisuje podatke domena aplikacije.
 */

package mf.fit.entity;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import mf.fit.dto.CurrencyResponse;

@Entity
@Table(indexes = {
        @Index(name = "idx_stanar_email", columnList = "email", unique = true),
        @Index(name = "idx_stanar_keycloak_id", columnList = "keycloak_id", unique = true)
})
public class Stanar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ime;
    private String prezime;
    private String brTelefona;
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(unique = true)
    private String email;

    @Column(name = "keycloak_id", unique = true)
    private String keycloakId;

    @Column(name = "tip_naloga")
    private Integer tipNaloga = 1;

    private Boolean starjesina;

    @ManyToOne
    @JoinColumn(name = "stan_id")
    @JsonIgnoreProperties({"detalji"})
    private Stan stan;

    @OneToMany(mappedBy = "stanar", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<TimezoneInfo> timezoneInfos = new ArrayList<>();

    @OneToMany(mappedBy = "stanar", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
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

    public String getEmail(){return email;}
    public void setEmail(String email){this.email = email;}

    public String getKeycloakId(){return keycloakId;}
    public void setKeycloakId(String keycloakId){this.keycloakId = keycloakId;}

    public Integer getTipNaloga(){return tipNaloga;}
    public void setTipNaloga(Integer tipNaloga){this.tipNaloga = tipNaloga;}

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

