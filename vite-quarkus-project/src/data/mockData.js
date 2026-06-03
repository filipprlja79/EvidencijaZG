export const mockZgrade = [
  { id: 1, naziv: 'Zgrada Central', vlasnik: 'Etažni vlasnici', grad: 'Podgorica', naselje: 'City kvart' },
  { id: 2, naziv: 'Rezidencija Morača', vlasnik: 'Invest Mont', grad: 'Podgorica', naselje: 'Preko Morače' },
  { id: 3, naziv: 'Boka View', vlasnik: 'Boka Estate', grad: 'Kotor', naselje: 'Dobrota' },
]

export const mockUlazi = [
  { id: 1, brojUlaza: 'A', nazivUlaza: 'Lamela A', brojZiroRacuna: '520-12345-67', zgrada: mockZgrade[0] },
  { id: 2, brojUlaza: 'B', nazivUlaza: 'Lamela B', brojZiroRacuna: '520-76543-21', zgrada: mockZgrade[0] },
  { id: 3, brojUlaza: '1', nazivUlaza: 'Glavni ulaz', brojZiroRacuna: '535-22222-11', zgrada: mockZgrade[1] },
]

export const mockStanovi = [
  { id: 1, brojStana: 12, imeVlasnikaStana: 'Marko Vuković', ulaz: mockUlazi[0], detalji: { kvadratura: 62, brojClanova: 3, sprat: 2, napomena: '' } },
  { id: 2, brojStana: 18, imeVlasnikaStana: 'Ana Popović', ulaz: mockUlazi[0], detalji: { kvadratura: 48, brojClanova: 2, sprat: 3, napomena: 'Izdaje se' } },
  { id: 3, brojStana: 4, imeVlasnikaStana: 'Nikola Radović', ulaz: mockUlazi[1], detalji: { kvadratura: 71, brojClanova: 4, sprat: 1, napomena: '' } },
]

export const mockStanari = [
  { id: 1, ime: 'Marko', prezime: 'Vuković', brTelefona: '+382 67 111 222', username: 'marko', email: 'marko@example.com', starjesina: true, tipNaloga: 2, stan: mockStanovi[0], trenutniDug: 0 },
  { id: 2, ime: 'Ana', prezime: 'Popović', brTelefona: '+382 68 333 444', username: 'ana', email: 'ana@example.com', starjesina: false, tipNaloga: 1, stan: mockStanovi[1], trenutniDug: 45 },
  { id: 3, ime: 'Nikola', prezime: 'Radović', brTelefona: '+382 69 555 666', username: 'nikola', email: 'nikola@example.com', starjesina: false, tipNaloga: 1, stan: mockStanovi[2], trenutniDug: 90 },
]

export const mockObavjestenja = [
  { id: 1, naslov: 'Servis lifta', tekst: 'Lift neće raditi u utorak od 09:00 do 12:00.', tip: 'ENTRANCE', kreiranoAt: '2026-05-01T10:00:00', stanari: mockStanari.slice(0, 2), status: 'Aktivno' },
  { id: 2, naslov: 'Čišćenje ulaza', tekst: 'Molimo stanare da uklone stvari iz hodnika.', tip: 'GENERAL', kreiranoAt: '2026-05-05T08:30:00', stanari: mockStanari, status: 'Aktivno' },
]

export const mockPlacanja = [
  { id: 1, stanar: mockStanari[0], stan: mockStanovi[0], mjesec: 'Maj 2026', iznos: 25, status: 'Plaćeno', datumUplate: '2026-05-03' },
  { id: 2, stanar: mockStanari[1], stan: mockStanovi[1], mjesec: 'Maj 2026', iznos: 25, status: 'Nije plaćeno', datumUplate: null },
  { id: 3, stanar: mockStanari[2], stan: mockStanovi[2], mjesec: 'Maj 2026', iznos: 25, status: 'Djelimično', datumUplate: '2026-05-06' },
]

export const mockDugovanja = [
  { id: 1, stanar: mockStanari[1], stan: mockStanovi[1], ukupanDug: 45, neplaceniMjeseci: 2, zadnjaUplata: '2026-03-12' },
  { id: 2, stanar: mockStanari[2], stan: mockStanovi[2], ukupanDug: 90, neplaceniMjeseci: 4, zadnjaUplata: '2026-01-08' },
]

export const mockOdrzavanje = [
  { id: 1, naslov: 'Kvar na liftu', prioritet: 'Visok', status: 'Otvoren', prijavio: mockStanari[1], stan: mockStanovi[1], datum: '2026-05-07', opis: 'Lift se zaustavlja između drugog i trećeg sprata.' },
  { id: 2, naslov: 'Rasvjeta u hodniku', prioritet: 'Srednji', status: 'U toku', prijavio: mockStanari[2], stan: mockStanovi[2], datum: '2026-05-06', opis: 'Ne radi svjetlo ispred stana 4.' },
]

export const mockDokumenti = [
  { id: 1, naziv: 'Kućni red', kategorija: 'Pravila', datum: '2026-04-12', dostupnoStanaru: true },
  { id: 2, naziv: 'Zapisnik sa sastanka etažnih vlasnika', kategorija: 'Zapisnici', datum: '2026-05-02', dostupnoStanaru: true },
  { id: 3, naziv: 'Ugovor o održavanju lifta', kategorija: 'Ugovori', datum: '2026-03-18', dostupnoStanaru: false },
]

export const mockPrekrsaji = [
  { id: 1, stanar: mockStanari[1], stan: mockStanovi[1], pravilo: 'Stvari u hodniku', status: 'Otvoreno', datum: '2026-05-04', napomena: 'Bicikl ostavljen ispred vrata.' },
  { id: 2, stanar: mockStanari[2], stan: mockStanovi[2], pravilo: 'Buka poslije 22h', status: 'Riješeno', datum: '2026-04-29', napomena: 'Upozorenje prihvaćeno.' },
]
