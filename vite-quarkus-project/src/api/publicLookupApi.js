/*
 * Komentar projekta: API helper za javne lookup liste koje se koriste prije login-a.
 */

import axiosClient from './axiosClient.js'

function toSelectOption(item) {
  return {
    value: String(item.id),
    label: item.description ? `${item.label} - ${item.description}` : item.label,
  }
}

export const publicLookupApi = {
  ulazi: async () => {
    const { data } = await axiosClient.get('/public/ulazi')
    return data.map(toSelectOption)
  },
  stanovi: async (ulazId) => {
    if (!ulazId) return []
    const { data } = await axiosClient.get(`/public/stanovi?ulazId=${ulazId}`)
    return data.map(toSelectOption)
  },
}
