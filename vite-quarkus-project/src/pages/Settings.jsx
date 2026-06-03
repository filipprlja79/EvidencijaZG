/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { Database, Globe2, ShieldCheck } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { API_BASE_URL } from '../api/axiosClient.js'

const launchChecklist = [
  'Resident portal: plaćanja, dokumenti, obavještenja i zahtjevi za održavanje',
  'Online naplata: mjesečno održavanje, dugovanja, podsjetnici i istorija uplata',
  'Održavanje: prijava kvara, prioritet, status i zatvaranje radnog naloga',
  'Dokumenti: kućni red, zapisnici, ugovori i vidljivost po ulozi',
  'Compliance: prekršaji kućnog reda, opomene i status rješavanja',
  'Izvještaji: PDF/CSV export za naplatu, dugovanja i aktivnosti ulaza',
  'Sigurnost: Keycloak role, audit log, backup i enkripcija osjetljivih podataka',
]

export default function Settings() {
  return (
    <section className="page-stack">
      <PageHeader title="Podešavanja" subtitle="Osnovna podešavanja aplikacije, API konekcije i sigurnosti." />
      <div className="settings-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h2>API konekcija</h2>
            <Database size={22} color="var(--primary)" />
          </div>
          <div className="info-list">
            <div className="info-row"><span>Base URL</span><strong>{API_BASE_URL}</strong></div>
            <div className="info-row"><span>HTTP klijent</span><strong>Axios</strong></div>
            <div className="info-row"><span>Status</span><Badge variant="success">Spremno</Badge></div>
          </div>
        </article>
        <article className="panel-card">
          <div className="panel-header">
            <h2>Sigurnost</h2>
            <ShieldCheck size={22} color="var(--success)" />
          </div>
          <p>Token se čita iz lokalnog storage-a i automatski šalje kroz Authorization header. Backend ostaje zadužen za role i dozvole.</p>
        </article>
        <article className="panel-card">
          <div className="panel-header">
            <h2>Regionalna podešavanja</h2>
            <Globe2 size={22} color="var(--info)" />
          </div>
          <div className="info-list">
            <div className="info-row"><span>Valuta</span><strong>EUR</strong></div>
            <div className="info-row"><span>Format datuma</span><strong>sr-ME</strong></div>
            <div className="info-row"><span>Jezik</span><strong>Crnogorski</strong></div>
          </div>
        </article>
        <article className="panel-card">
          <div className="panel-header">
            <h2>Launch checklist</h2>
            <Badge variant="info">Prodaja</Badge>
          </div>
          <div className="checklist">
            {launchChecklist.map((item) => (
              <label key={item}>
                <input type="checkbox" defaultChecked />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

