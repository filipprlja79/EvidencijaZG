/*
 * Komentar projekta: JPA entitet koji predstavlja fajl povezan sa drugim entitetima preko relacije.
 */

package mf.fit.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;

import java.io.File;

@Entity
public class UploadedFile {

    // Primarni kljuc je potreban jer JPA svaki @Entity mora jednoznacno identifikovati u bazi.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Naziv fajla koji se cuva u bazi i koristi za prikaz korisniku.
    private String filename;

    // Stvarni File objekat se ne cuva u bazi; sluzi samo privremeno dok aplikacija radi sa fajlom.
    @Transient
    private File file;

    public Long getId() {
        return id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public File getFile() {
        return file;
    }

    public void setFile(File file) {
        this.file = file;
    }
}
