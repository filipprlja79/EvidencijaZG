/*
 * Komentar projekta: API helper koji enkapsulira HTTP pozive prema Quarkus backend-u.
 */

import { mockPlacanja } from '../data/mockData.js'

export const placanjaApi = {
  list: async () => mockPlacanja,
}

