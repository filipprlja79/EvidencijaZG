/*
 * Komentar projekta: Page komponenta koja predstavlja jednu funkcionalnu stranicu aplikacije.
 */

import { BarChart3, Download, Euro, FileSpreadsheet, TrendingUp } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'

const reports = [
  { title: 'Finansijski izvještaj', description: 'Uplate, dugovanja, mjesečna naplata i otvorene obaveze.' },
  { title: 'Izvještaj po ulazu', description: 'Stanje stanova, stanara, uplata i zahtjeva za održavanje po ulazu.' },
  { title: 'Aktivnost stanara', description: 'Poruke, prijave kvarova, dokumenti i reakcije na obavještenja.' },
]

export default function Izvjestaji() {
  return (
    <section className="page-stack">
      <PageHeader title="Izvještaji" subtitle="Pregledi za prodaju, upravnike, starješine i etažne vlasnike." actions={<Button icon={Download}>Export PDF</Button>} />
      <div className="stats-grid">
        <StatCard icon={Euro} label="Naplata" value="87%" trend="Mjesečni score" tone="success" />
        <StatCard icon={TrendingUp} label="Rast uplata" value="+18%" trend="U odnosu na prošli mjesec" tone="info" />
        <StatCard icon={BarChart3} label="Aktivni izvještaji" value={reports.length} trend="Spremno za export" />
      </div>
      <div className="cards-grid">
        {reports.map((report) => (
          <article className="panel-card" key={report.title}>
            <div className="panel-header">
              <h2>{report.title}</h2>
              <FileSpreadsheet size={22} color="var(--primary)" />
            </div>
            <p>{report.description}</p>
            <Button variant="secondary" icon={Download}>Preuzmi</Button>
          </article>
        ))}
      </div>
    </section>
  )
}

