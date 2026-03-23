export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatDate = (dateString: string) => {
  // Parsing date string safely to avoid timezone issues for simple DD/MM/YYYY
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}
