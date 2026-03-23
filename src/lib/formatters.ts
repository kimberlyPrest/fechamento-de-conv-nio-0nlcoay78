export const formatCurrency = (value: number | string | null | undefined) => {
  const numValue = Number(value) || 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue)
}

export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'

  // Try to parse YYYY-MM-DD
  if (dateString.includes('-')) {
    const parts = dateString.split('T')[0].split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    }
  }
  return dateString
}
