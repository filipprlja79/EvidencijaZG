/*
 * Komentar projekta: API helper koji enkapsulira HTTP pozive prema Quarkus backend-u.
 */

import { mockDugovanja } from '../data/mockData.js'

export const dugovanjaApi = {
  list: async () => mockDugovanja,
}

