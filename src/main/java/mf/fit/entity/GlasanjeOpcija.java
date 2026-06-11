/*
 * Komentar projekta: Opcija za glasanje.
 */

package mf.fit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class GlasanjeOpcija {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tekst;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "glasanje_id")
    @JsonIgnore
    private Glasanje glasanje;

    public Long getId() { return id; }
    public String getTekst() { return tekst; }
    public void setTekst(String tekst) { this.tekst = tekst; }
    public Glasanje getGlasanje() { return glasanje; }
    public void setGlasanje(Glasanje glasanje) { this.glasanje = glasanje; }
}
